using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        
        [HttpGet()]
        public IActionResult GetSalesSummary()
        {
            // 1. تجميع كل أرقام الأوردرات في كويري SQL واحد (Synchronous)
            var orderStats = repo.GetAll<Order>() // لازم ترجع IQueryable
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalOrders = g.Count(),
                    TotalSales = g.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.Total),
                    ActiveOrders = g.Count(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Completed)
                })
                .FirstOrDefault();

            var totalOrders = orderStats?.TotalOrders ?? 0;
            var totalSales = orderStats?.TotalSales ?? 0;
            var totalActiveOrders = orderStats?.ActiveOrders ?? 0;

            // 2. الكاش من جدول المدفوعات مباشرة عشان الدقة
            var totalCashPayments = repo.GetAll<Payment>()
                .Where(p => p.Order.Status == OrderStatus.Completed && p.Method == PaymentMethod.Cash)
                .Sum(p => p.Amount);

            // 3. العملاء والمنتجات
            var customerStats = repo.GetAll<CustomerProfile>()
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalCustomers = g.Count(),
                    TotalVip = g.Count(c => c.Vip)
                })
                .FirstOrDefault();

            var totalCustomers = customerStats?.TotalCustomers ?? 0;
            var totalVipCustomers = customerStats?.TotalVip ?? 0;

            var totalProducts = repo.GetAll<Product>().Count;

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
