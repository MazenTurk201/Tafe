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

            var totalOrdersTask =
                orders.CountAsync();

            var totalSalesTask =
                orders
                    .Where(o => o.Status == OrderStatus.Completed)
                    .SumAsync(o => o.Total);

            var totalActiveOrdersTask =
                orders
                    .CountAsync(o =>
                        o.Status != OrderStatus.Cancelled &&
                        o.Status != OrderStatus.Completed);

            var totalCashPaymentsTask =
                payments
                    .Where(p =>
                        p.Order.Status == OrderStatus.Completed &&
                        p.Method == PaymentMethod.Cash)
                    .SumAsync(p => p.Amount);

            var totalCustomersTask =
                customers.CountAsync();

            var totalVipCustomersTask =
                customers.CountAsync(c => c.Vip);

            var totalProductsTask =
                products.CountAsync();

            await Task.WhenAll(
                totalOrdersTask,
                totalSalesTask,
                totalActiveOrdersTask,
                totalCashPaymentsTask,
                totalCustomersTask,
                totalVipCustomersTask,
                totalProductsTask
            );

            return Ok(new
            {
                TotalCashPayments = totalCashPaymentsTask.Result,
                TotalSales = totalSalesTask.Result,
                TotalOrders = totalOrdersTask.Result,
                TotalCustomers = totalCustomersTask.Result,
                TotalProducts = totalProductsTask.Result,
                TotalVips = totalVipCustomersTask.Result,
                TotalActiveOrders = totalActiveOrdersTask.Result
            });
        }
    }
}