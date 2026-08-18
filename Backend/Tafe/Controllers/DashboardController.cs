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
    public class DashboardController(GenericRepo repo) : ControllerBase
    {
        private readonly GenericRepo repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetSalesSummary()
        {
            var orders = repo.GetAll<Order>();
            var payments = repo.GetAll<Payment>();
            var customers = repo.GetAll<CustomerProfile>();
            var products = repo.GetAll<Product>();
        
            var totalOrders =
                await orders.CountAsync();
        
            var totalSales =
                (decimal)await orders
                    .Where(o => o.Status == OrderStatus.Completed)
                    .SumAsync(o => (double)o.Total);

            var totalActiveOrders =
                await orders.CountAsync(o =>
                    o.Status != OrderStatus.Cancelled &&
                    o.Status != OrderStatus.Completed);

            var totalCashPayments =
                (decimal)await payments
                    .Where(p =>
                        p.Order.Status == OrderStatus.Completed &&
                        p.Method == PaymentMethod.Cash)
                    .SumAsync(p => (double)p.Amount);

            var totalCustomers =
                await customers.CountAsync();
        
            var totalVipCustomers =
                await customers.CountAsync(c => c.Vip);
        
            var totalProducts =
                await products.CountAsync();

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
    }
}