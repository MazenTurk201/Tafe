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
    public class ExpensesController : ControllerBase
    {
        private readonly GenericRepo repo;

        public ExpensesController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public async Task<IActionResult> GetExpenses()
        {
            return Ok(await repo.GetAll<Expense>()
                .Select(c => new { c.Id, c.Name, c.Amount, c.ExpenseDate, Type = c.Type.ToString(), c.Notes }).ToListAsync());
        }
        [HttpGet("Total")]
        public IActionResult GetTotalExpenses()
        {
            var totalExpenses = repo.GetAll<Expense>().Sum(e => e.Amount);
            return Ok(new { TotalExpenses = totalExpenses });
        }
        [HttpGet("Total/{startDate}/{endDate}")]
        public IActionResult GetTotalExpenses(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
            {
                (endDate, startDate) = (startDate, endDate);
            }
            var totalExpenses = repo.GetAll<Expense>().Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate).Sum(e => e.Amount);
            return Ok(new { TotalExpenses = totalExpenses });
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost]
        public async Task<IActionResult> AddExpenses(ExpenseDTO expenseCreateDTO) 
        {
            repo.Add(new Expense { Name = expenseCreateDTO.Name, ExpenseDate = expenseCreateDTO.ExpenseDate, Amount = expenseCreateDTO.Amount, Notes = expenseCreateDTO.Notes, Type = expenseCreateDTO.Type });
            await repo.Save();
            return CreatedAtAction(nameof(GetExpenses), new { id = repo.Get<Expense>(expenseCreateDTO.Name)!.Id });
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public async Task<IActionResult> PatchExpenses(ExpenseDTO ExpenseDTO)
        {
            var Expense = repo.Get<Expense>(ExpenseDTO.Id);
            if (Expense == null)
            {
                return NotFound();
            }

            Expense.Name = ExpenseDTO.Name;
            Expense.Amount = ExpenseDTO.Amount;
            Expense.ExpenseDate = ExpenseDTO.ExpenseDate;
            Expense.Type = ExpenseDTO.Type;
            Expense.Notes = ExpenseDTO.Notes;
            await repo.Update(Expense);
            await repo.Save();

            return Ok(Expense);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteExpenses(int id)
        {
            var Expense = repo.Get<Expense>(id);
            if (Expense == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<Expense>(id);
            await repo.Save();

            return Ok(Expense);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public async Task<IActionResult> GetDeletedExpenses()
        {
            return Ok(await repo.GetAllDeleted<Expense>()
                .Select(c => new { c.Id, c.Name, c.Amount, c.ExpenseDate, Type = c.Type.ToString(), c.Notes }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreExpense(int id)
        {
            await repo.Restore<Expense>(id);
            await repo.Save();

            return Ok();
        }
    }
}
