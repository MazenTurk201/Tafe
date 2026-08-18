using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Authorize(Roles = "Admin, Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController(GenericRepo repo) : ControllerBase
    {
        private readonly GenericRepo repo = repo;

        [HttpGet("Sales/{fromDate}/{toDate}")]
        public IActionResult SalesFromTo( DateTime fromDate, DateTime toDate )
        {
            return Ok();
        }
        [HttpGet("SalesByDate/{theDate}")]
        public IActionResult SalesByDate( DateTime theDate )
        {
            return Ok();
        }
        [HttpGet("TopProducts/{limit}")]
        public async Task<IActionResult> TopProducts( int limit = 3 )
        {
            return Ok(await repo.GetAll<Order>()
        .SelectMany(o => o.Items)
        .GroupBy(i => new { i.ProductId, i.Product.Name })
        .Select(g => new 
        { 
            g.Key.ProductId, 
            g.Key.Name, 
            TotalQuantity = g.Sum(i => i.Quantity) // Or g.Count() depending on business logic
        })
        .OrderByDescending(p => p.TotalQuantity)
        .Take(limit)
        .ToListAsync());
        }
        // Payments
        // Employees
        // Attendance
        // Attendance from to
        // Purchases (invoices total suppliers)
        // Customers
        // TopCustomers

    }
}
