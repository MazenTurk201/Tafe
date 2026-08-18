using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CafeTablesController : ControllerBase
    {
        private readonly GenericRepo repo;

        public CafeTablesController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public async Task<IActionResult> GetCafeTables()
        {
            return Ok(await repo.GetAll<CafeTable>()
                .Select(c => new { c.Id, c.Name, c.Capacity, c.IsOccupied, TotalOrders = c.Orders.Select(t=>t.Total), Reservations = c.Reservations.Select(t => new{Start = t.StartTime, End = t.EndTime, Note=t.Notes}) }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public async Task<IActionResult> AddCafeTables(string Name) 
        {
            repo.Add(new CafeTable { Name = Name, Capacity = 0, IsOccupied = false });
            await repo.Save();
            return CreatedAtAction(nameof(GetCafeTables), new { id = repo.Get<CafeTable>(Name)!.Id });
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch]
        public async Task<IActionResult> PatchCafeTables(CafeTableDTO cafeTableDTO)
        {
            var CafeTable = repo.Get<CafeTable>(cafeTableDTO.Id);
            if (CafeTable == null)
            {
                return NotFound();
            }

            CafeTable.Name = cafeTableDTO.Name;
            CafeTable.Capacity = cafeTableDTO.Capacity;
            CafeTable.IsOccupied = cafeTableDTO.IsOccupied;
            await repo.Update(CafeTable);
            await repo.Save();

            return Ok(CafeTable);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteCafeTables(int id)
        {
            var CafeTable = repo.Get<CafeTable>(id);
            if (CafeTable == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<CafeTable>(id);
            await repo.Save();

            return Ok(CafeTable);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedCafeTables()
        {
            return Ok(repo.GetAllDeleted<CafeTable>()
                .Select(c => new { c.Id, c.Name }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreCafeTable(int id)
        {
            await repo.Restore<CafeTable>(id);
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpGet("Reservation/Active")]
        public async Task<IActionResult> Reservation()
        {
            return Ok(await repo.GetAll<CafeTable>()
                .Where(c => c.Reservations.Any(r => r.StartTime <= DateTime.UtcNow && r.EndTime >= DateTime.UtcNow))
                .ToListAsync()
            );
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpGet("Reservation/Active/Count")]
        public async Task<IActionResult> ReservationCount()
        {
            return Ok(await repo.GetAll<CafeTable>()
                .CountAsync(c => c.Reservations.Any(r => r.StartTime <= DateTime.UtcNow && r.EndTime >= DateTime.UtcNow))
            );
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpGet("Reservation/Active/{id}")]
        public IActionResult ReservationById(int id)
        {
            var cafeTable = repo.Get<CafeTable>(id);
            if (cafeTable == null)
            {
                return NotFound();
            }

            var activeReservation = cafeTable.Reservations
                .FirstOrDefault(r => r.StartTime <= DateTime.UtcNow && r.EndTime >= DateTime.UtcNow);

            if (activeReservation == null)
            {
                return NotFound();
            }

            return Ok(activeReservation);
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost("Reservation/AddReservation")]
        public async Task<IActionResult> AddReservation(ReservationDTO reservationDTO)
        {
            var cafeTable = repo.Get<CafeTable>(reservationDTO.TableId);
            if (cafeTable == null)
            {
                return NotFound();
            }

            repo.Add(new Reservation
            {
                StartTime = reservationDTO.StartTime,
                EndTime = reservationDTO.EndTime,
                Notes = reservationDTO.Notes,
                TableId = reservationDTO.TableId,
                CustomerId = reservationDTO.CustomerId,
                Guests = reservationDTO.Guests
            });
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpDelete("Reservation/CancelReservation")]
        public async Task<IActionResult> CancelReservationAsync(int reservationId)
        {
            var reservation = repo.Get<Reservation>(reservationId);
            if (reservation == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<Reservation>(reservationId);
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpGet("Reservation/CanceledReservation")]
        public async Task<IActionResult> GetCanceledReservationAsync()
        {
            return Ok(await repo.GetAllDeleted<Reservation>()
                .Select(r => new { r.Id, r.StartTime, r.EndTime, r.Notes, r.TableId, r.CustomerId, CustName = r.Customer.User.FullName, r.Guests }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch("Reservation/RestoreReservation")]
        public async Task<IActionResult> RestoreReservationAsync(int reservationId)
        {
            await repo.Restore<Reservation>(reservationId);
            await repo.Save();

            return Ok();
        }
    }
}
