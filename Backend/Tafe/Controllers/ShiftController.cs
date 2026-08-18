// #nullable disable
// using System.ComponentModel.DataAnnotations.Schema;

// namespace Tafe.Models
// {
//     public class Shift : EntityTemplate
//     {
//         public string UserId { get; set; }
//         public virtual ApplicationUser User { get; set; }

//         public DateTime OpenedAt { get; set; }

//         public DateTime? ClosedAt { get; set; }

//         [Column(TypeName = "decimal(18,2)")]
//         public decimal OpeningCash { get; set; }

//         [Column(TypeName = "decimal(18,2)")]
//         public decimal ClosingCash { get; set; }

//         [Column(TypeName = "decimal(18,2)")]
//         public decimal ExpectedCash { get; set; }

//         [Column(TypeName = "decimal(18,2)")]
//         public decimal Difference { get; set; }

//         public bool IsClosed { get; set; }

//         public virtual ICollection<Payment> Payments { get; set; } = [];
//     }
// }

using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public ShiftsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetShifts()
        {
            return Ok(await repo.GetAll<Shift>()
                .Select(u => new { u.Id, u.Name, u.OpenedAt, u.ClosedAt, u.OpeningCash, u.ClosingCash, u.ExpectedCash, u.Difference, u.IsClosed, User = new { u.User.Id, u.User.UserName, u.User.FullName } }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Active")]
        public async Task<IActionResult> GetActiveShifts()
        {
            return Ok(await repo.GetAll<Shift>()
                .Where(s => s.IsClosed == false)
                .Select(u => new { u.Id, u.Name, u.OpenedAt, u.ClosedAt, u.OpeningCash, u.ClosingCash, u.ExpectedCash, u.Difference, u.IsClosed, User = new { u.User.Id, u.User.UserName } }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Today")]
        public async Task<IActionResult> GetTodayShifts()
        {
            return Ok(await repo.GetAll<Shift>()
                .Where(s => s.OpenedAt.Date == DateTime.UtcNow.Date)
                .Select(u => new { u.Id, u.Name, u.OpenedAt, u.ClosedAt, u.OpeningCash, u.ClosingCash, u.ExpectedCash, u.Difference, u.IsClosed, User = new { u.User.Id, u.User.UserName, u.User.FullName } }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpGet("Status")]
        public IActionResult MyStatus()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = repo.GetAll<ApplicationUser>().FirstOrDefault(u => u.Id == userId);
            if (user == null) return Unauthorized();

            var activeShift = repo.GetAll<Shift>().FirstOrDefault(s => s.UserId == userId && !s.IsClosed);
            
            return Ok(activeShift != null);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("{startDate}/{endDate}")]
        public async Task<IActionResult> GetShifts(DateTime startDate, DateTime endDate)
        {
            return Ok(await repo.GetAll<Shift>()
                .Where(s => s.OpenedAt >= startDate && s.OpenedAt <= endDate)
                .Select(u => new { u.Id, u.Name, u.OpenedAt, u.ClosedAt, u.OpeningCash, u.ClosingCash, u.ExpectedCash, u.Difference, u.IsClosed, User = new { u.User.Id, u.User.UserName, u.User.FullName } }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost("OpenShift")]
        public async Task<IActionResult> CreateShift(decimal OpeningCash)
        {
            if (ModelState.IsValid)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId)) return Unauthorized();
                var user = repo.GetAll<ApplicationUser>().FirstOrDefault(u => u.Id == userId);
                if (user == null) return Unauthorized();

                var activeShift = repo.GetAll<Shift>().FirstOrDefault(s => s.UserId == userId && !s.IsClosed);
                
                if (activeShift != null) return BadRequest("You already have an active shift.");

                repo.Add(new Shift { Name = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"), ClosedAt = null, IsClosed = false ,OpenedAt = DateTime.UtcNow, OpeningCash = OpeningCash, ClosingCash = 0, ExpectedCash = 0, Difference = 0, UserId = userId });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost("CloseShift")]
        public async Task<IActionResult> CloseShift(decimal ClosingCash)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var shift = repo.GetAll<Shift>().FirstOrDefault( s => s.UserId == userId && !s.IsClosed );

            if (shift == null) return NotFound("You don't have an active shift.");


            List<Payment> payments = [.. repo.GetAll<Payment>().Where(p => p.ShiftId == shift.Id && p.Method == PaymentMethod.Cash)];
            decimal totalPayments = payments.Sum(p => p.Amount);

            shift.ClosedAt = DateTime.UtcNow;
            shift.IsClosed = true;
            shift.ClosingCash = ClosingCash;
            shift.ExpectedCash = shift.OpeningCash + totalPayments;
            shift.Difference = shift.ClosingCash - shift.ExpectedCash;

            await repo.Update(new Shift { Id = shift.Id, ClosedAt = shift.ClosedAt, IsClosed = shift.IsClosed, ClosingCash = shift.ClosingCash, ExpectedCash = shift.ExpectedCash, Difference = shift.Difference, OpenedAt = shift.OpenedAt, OpeningCash = shift.OpeningCash, UserId = shift.UserId });
            await repo.Save();

            return Ok();
        }
    }
}
