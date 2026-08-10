using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Authorize(Roles = "Admin, Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly GenericRepo repo;

        public DashboardController(GenericRepo repo)
        {
            this.repo = repo;
        }

        [HttpGet()]
        public IActionResult GetSalesSummary()
        {
            var totalCashPayments = repo.GetAll<Order>()
                .Where(o => o.Status == OrderStatus.Completed && o.Payments.Any(p => p.Method == PaymentMethod.Cash))
                .Sum(o => o.Total);
            var totalSales = repo.GetAll<Order>().Where(o => o.Status == OrderStatus.Completed).Sum(o => o.Total);
            var totalOrders = repo.GetAll<Order>().Count(o => o.Status == OrderStatus.Completed);
            var totalCustomers = repo.GetAll<CustomerProfile>().Count;
            var totalProducts = repo.GetAll<Product>().Count;
            var totalVipCustomers = repo.GetAll<CustomerProfile>().Count(c => c.Vip);
            var totalActiveOrders = repo.GetAll<Order>().Count(o => o.Status == OrderStatus.Pending);

            return Ok(new
            {
                TotalCashPayments = totalCashPayments,
                TotalSales = totalSales,
                TotalOrders = totalOrders,
                TotalCustomers = totalCustomers,
                TotalProducts = totalProducts,
                TotalVips = totalVipCustomers,
                TotalActiveOrders = totalActiveOrders
            });
        }
        // Active Shifts...

    }
}
