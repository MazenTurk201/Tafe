using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Authorize(Roles = "Admin, Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryPaymentsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public SalaryPaymentsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetSalaryPayments()
        {
            return Ok(repo.GetAll<SalaryPayment>()
                .Select(u => new { u.Id, u.Name, u.Amount, u.Month, u.Year, u.PaidAt, Employee = new { u.Employee.UserId, u.Employee.User.UserName, u.Employee.User.FullName } }));
        }
        [HttpPost]
        public async Task<IActionResult> CreateSalaryPayment(SalaryPaymentCreateDTO dto)
        {
            if (ModelState.IsValid)
            {
                var salaryPayment = new SalaryPayment
                {
                    EmployeeProfileId = dto.EmployeeProfileId,
                    Month = dto.Month,
                    Year = dto.Year,
                    Amount = dto.Amount,
                    PaidAt = dto.PaidAt,
                    Notes = dto.Notes
                };

                repo.Add(salaryPayment);
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteSalaryPayment(int id)
        {
            await repo.SoftDelete<SalaryPayment>(id);
            await repo.Save();
            return Ok();
        }
        [HttpPatch]
        public async Task<IActionResult> PatchSalaryPayment(int id, string Name)
        {
            var SalaryPayment = repo.Get<SalaryPayment>(id);
            if (SalaryPayment == null)
            {
                return NotFound();
            }

            SalaryPayment.Name = Name;
            await repo.Update(SalaryPayment);
            await repo.Save();

            return Ok(SalaryPayment);
        }
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreSalaryPayment(int id)
        {
            var SalaryPayment = repo.Get<SalaryPayment>(id);

            await repo.Restore<SalaryPayment>(id);
            await repo.Save();

            return Ok(SalaryPayment);
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedSalaryPayments()
        {
            return Ok(repo.GetAllDeleted<SalaryPayment>()
                .Select(u => new { u.Id, u.Name }));
        }
    }
}
