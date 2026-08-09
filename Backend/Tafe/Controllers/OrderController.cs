using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using Tafe.DB;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly DBContext db;

        public OrdersController(GenericRepo repo, DBContext db)
        {
            this.repo = repo;
            this.db = db;
        }

        // ===================== GET =====================

        [HttpGet]
        public IActionResult GetOrders()
        {
            return Ok(repo.GetAll<Order>().Select(ToDTO));
        }

        [HttpGet("{id}")]
        public IActionResult GetOrder(int id)
        {
            var order = repo.Get<Order>(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(ToDTO(order));
        }

        [HttpGet("Status/{status}")]
        public IActionResult GetOrdersByStatus(OrderStatus status)
        {
            return Ok(repo.GetAll<Order>().Where(o => o.Status == status).Select(ToDTO));
        }

        [HttpGet("Type/{type}")]
        public IActionResult GetOrdersByType(OrderType type)
        {
            return Ok(repo.GetAll<Order>().Where(o => o.OrderType == type).Select(ToDTO));
        }

        [HttpGet("Active")]
        public IActionResult GetActiveOrders()
        {
            return Ok(repo.GetAll<Order>()
                .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
                .Select(ToDTO));
        }

        [HttpGet("ByDate/{start}/{end}")]
        public IActionResult GetOrdersByDate(DateTime start, DateTime end)
        {
            if (start > end)
            {
                (end, start) = (start, end);
            }
            return Ok(repo.GetAll<Order>().Where(o => o.CreatedAt >= start && o.CreatedAt <= end).Select(ToDTO));
        }

        [HttpGet("Today")]
        public IActionResult GetTodayOrders()
        {
            var start = DateTime.UtcNow.Date;
            return Ok(repo.GetAll<Order>()
                .Where(o => o.CreatedAt >= start && o.CreatedAt < start.AddDays(1))
                .Select(ToDTO));
        }

        [HttpGet("Customer/{customerId}")]
        public IActionResult GetCustomerOrders(string customerId)
        {
            return Ok(repo.GetAll<Order>().Where(o => o.CustomerId == customerId).Select(ToDTO));
        }

        [HttpGet("Revenue/{start}/{end}")]
        public IActionResult GetRevenue(DateTime start, DateTime end)
        {
            if (start > end)
            {
                (end, start) = (start, end);
            }
            var orders = repo.GetAll<Order>().Where(o => o.CreatedAt >= start && o.CreatedAt <= end && o.Status != OrderStatus.Cancelled);
            return Ok(new
            {
                StartDate = start,
                EndDate = end,
                OrderCount = orders.Count(),
                TotalRevenue = orders.Sum(o => o.Total),
                TotalDiscount = orders.Sum(o => o.Discount),
                TotalTax = orders.Sum(o => o.Tax),
                TotalService = orders.Sum(o => o.Service)
            });
        }

        // ===================== POST =====================

        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(OrderCreateDTO orderCreate)
        {
            if (orderCreate.Items == null || orderCreate.Items.Count == 0)
            {
                return BadRequest("Order must contain at least one item.");
            }

            var cashierId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (cashierId == null)
            {
                return Unauthorized();
            }

            var cashier = db.Set<ApplicationUser>().Find(cashierId);
            if (cashier == null)
            {
                return Unauthorized();
            }

            if (!string.IsNullOrWhiteSpace(orderCreate.CustomerId))
            {
                var customer = repo.GetP<CustomerProfile>(orderCreate.CustomerId);
                if (customer == null)
                {
                    return NotFound("Customer not found.");
                }
            }

            var order = new Order
            {
                CashierId = cashierId,
                Cashier = cashier,
                CustomerId = orderCreate.CustomerId,
                TableId = orderCreate.TableId,
                OrderType = orderCreate.TableId.HasValue ? OrderType.DineIn : orderCreate.OrderType,
                Discount = orderCreate.Discount,
                Tax = orderCreate.Tax,
                Service = orderCreate.Service
            };

            foreach (var itemDTO in orderCreate.Items)
            {
                var product = repo.Get<Product>(itemDTO.ProductId);
                if (product == null)
                {
                    return NotFound($"Product {itemDTO.ProductId} not found.");
                }

                order.Items.Add(new OrderItem
                {
                    ProductId = itemDTO.ProductId,
                    Quantity = itemDTO.Quantity,
                    UnitPrice = product.Price,
                    Discount = itemDTO.Discount,
                    Total = product.Price * itemDTO.Quantity - itemDTO.Discount,
                    Notes = itemDTO.Notes
                });
            }

            RecalculateTotals(order);

            if (order.TableId is not null)
            {
                var table = await db.CafeTables
                    .FirstOrDefaultAsync(t => t.Id == order.TableId);

                if (table == null)
                    return NotFound("Table not found.");

                if (table.IsOccupied)
                    return Conflict("Table is already occupied.");

                table.IsOccupied = true;
            }

            repo.Add(order);
            await repo.Save();

            foreach (var item in order.Items)
            {
                DeductStock(item, cashierId);
            }
            await repo.Save();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, ToDTO(repo.Get<Order>(order.Id)!));
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost("AddPayment")]
        public async Task<IActionResult> AddPayment(PaymentCreateDTO paymentDTO)
        {
            var order = LoadOrder(paymentDTO.OrderId);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            var shift = repo.GetAll<Shift>().FirstOrDefault(s => s.UserId == User.FindFirstValue(ClaimTypes.NameIdentifier) && !s.IsClosed);
            if (shift == null)
            {
                return BadRequest("No active shift found for the current user.");
            }

            var payment = new Payment
            {
                OrderId = paymentDTO.OrderId,
                ShiftId = shift.Id,
                Method = paymentDTO.Method,
                Amount = paymentDTO.Amount,
                TransactionNumber = paymentDTO.TransactionNumber
            };

            repo.Add(payment);
            await repo.Save();

            return Ok(payment);
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPost("AddItem")]
        public async Task<IActionResult> AddItemToOrder(int orderId, OrderItemCreateDTO itemDTO)
        {
            var order = LoadOrder(orderId);
            if (order == null)
            {
                return NotFound();
            }

            var product = repo.Get<Product>(itemDTO.ProductId);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var item = new OrderItem
            {
                OrderId = orderId,
                ProductId = itemDTO.ProductId,
                Quantity = itemDTO.Quantity,
                UnitPrice = product.Price,
                Discount = itemDTO.Discount,
                Total = product.Price * itemDTO.Quantity - itemDTO.Discount,
                Notes = itemDTO.Notes
            };

            order.Items.Add(item);
            RecalculateTotals(order);
            DeductStock(item, order.CashierId);
            await repo.Save();

            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }

        // ===================== PATCH =====================

        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch]
        public async Task<IActionResult> PatchOrder(OrderUpdateDTO orderDTO)
        {
            var order = LoadOrder(orderDTO.Id);
            if (order == null)
            {
                return NotFound();
            }

            if (orderDTO.CustomerId != null)
            {
                if (string.IsNullOrWhiteSpace(orderDTO.CustomerId))
                {
                    order.CustomerId = null;
                }
                else
                {
                    var customer = repo.GetP<CustomerProfile>(orderDTO.CustomerId);
                    if (customer == null)
                    {
                        return NotFound("Customer not found.");
                    }
                    order.CustomerId = orderDTO.CustomerId;
                }
            }

            if (orderDTO.OrderType.HasValue)
            {
                order.OrderType = orderDTO.OrderType.Value;
            }

            if (orderDTO.TableId.HasValue && orderDTO.TableId.Value != order.TableId)
            {
                ReleaseTable(order);
                if (orderDTO.TableId.Value != 0)
                {
                    var newTable = db.CafeTables.FirstOrDefault(t => t.Id == orderDTO.TableId.Value);
                    if (newTable == null)
                    {
                        return NotFound("Table not found.");
                    }
                    if (newTable.IsOccupied)
                    {
                        return Conflict("Table is already occupied.");
                    }
                    newTable.IsOccupied = true;
                    order.OrderType = OrderType.DineIn;
                }
                order.TableId = orderDTO.TableId.Value;
            }

            if (orderDTO.Discount.HasValue)
            {
                order.Discount = orderDTO.Discount.Value;
            }
            if (orderDTO.Tax.HasValue)
            {
                order.Tax = orderDTO.Tax.Value;
            }
            if (orderDTO.Service.HasValue)
            {
                order.Service = orderDTO.Service.Value;
            }

            RecalculateTotals(order);
            await repo.Save();

            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch("RemoveItem")]
        public async Task<IActionResult> RemoveItemFromOrder(int orderId, int itemId)
        {
            var order = LoadOrder(orderId);
            if (order == null)
            {
                return NotFound();
            }

            var item = order.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
            {
                return NotFound("Item not found in order.");
            }

            RestoreStock(item, order.CashierId);
            order.Items.Remove(item);
            RecalculateTotals(order);
            await repo.Save();
            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch("RemovePayment")]
        public async Task<IActionResult> RemovePaymentFromOrder(int orderId, int paymentId)
        {
            var order = LoadOrder(orderId);
            if (order == null)
            {
                return NotFound();
            }
            var payment = db.Payments.FirstOrDefault(p => p.Id == paymentId && p.OrderId == orderId);
            if (payment == null)
            {
                return NotFound("Payment not found for this order.");
            }

            db.Payments.Remove(payment);
            await repo.Save();
            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch("Status")]
        public async Task<IActionResult> ChangeOrderStatus(OrderStatusDTO statusDTO)
        {
            var order = LoadOrder(statusDTO.Id);
            if (order == null)
            {
                return NotFound();
            }

            var oldStatus = order.Status;
            if (oldStatus == statusDTO.Status)
            {
                return Ok(ToDTO(order));
            }

            order.Status = statusDTO.Status;

            if (statusDTO.Status == OrderStatus.Cancelled)
            {
                foreach (var item in order.Items)
                {
                    RestoreStock(item, order.CashierId);
                }
                ReleaseTable(order);
            }
            else if (statusDTO.Status == OrderStatus.Completed)
            {
                ReleaseTable(order);
            }

            await repo.Save();

            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }

        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch("Item")]
        public async Task<IActionResult> PatchOrderItem(OrderItemDTO itemDTO)
        {
            var item = db.OrderItems.AsNoTracking().FirstOrDefault(i => i.Id == itemDTO.Id);
            if (item == null)
            {
                return NotFound("Item not found.");
            }

            var order = LoadOrder(item.OrderId);
            if (order == null)
            {
                return NotFound();
            }

            var trackedItem = order.Items.First(i => i.Id == item.Id);

            RestoreStock(trackedItem, order.CashierId);

            if (itemDTO.ProductId != 0 && itemDTO.ProductId != trackedItem.ProductId)
            {
                var product = repo.Get<Product>(itemDTO.ProductId);
                if (product == null)
                {
                    return NotFound("Product not found.");
                }
                trackedItem.ProductId = itemDTO.ProductId;
                trackedItem.UnitPrice = product.Price;
            }

            trackedItem.Quantity = itemDTO.Quantity;
            trackedItem.Discount = itemDTO.Discount;
            trackedItem.Notes = itemDTO.Notes;
            trackedItem.Total = trackedItem.UnitPrice * trackedItem.Quantity - trackedItem.Discount;

            DeductStock(trackedItem, order.CashierId);
            RecalculateTotals(order);
            await repo.Save();

            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }

        // ===================== DELETE =====================

        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = LoadOrder(id);
            if (order == null)
            {
                return NotFound();
            }

            if (order.Status != OrderStatus.Cancelled)
            {
                foreach (var item in order.Items)
                {
                    RestoreStock(item, order.CashierId);
                }
            }
            ReleaseTable(order);

            await repo.SoftDelete<Order>(id);
            await repo.Save();

            return Ok();
        }

        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpDelete("Item/{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var item = db.OrderItems.AsNoTracking().FirstOrDefault(i => i.Id == id);
            if (item == null)
            {
                return NotFound("Item not found.");
            }

            var order = LoadOrder(item.OrderId);
            if (order == null)
            {
                return NotFound();
            }

            RestoreStock(item, order.CashierId);
            await repo.SoftDelete<OrderItem>(id);

            order.SubTotal = order.Items.Where(i => i.Id != id).Sum(i => i.Total);
            order.Total = order.SubTotal - order.Discount + order.Tax + order.Service;

            await repo.Save();

            return Ok(ToDTO(repo.Get<Order>(order.Id)!));
        }

        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedOrders()
        {
            return Ok(repo.GetAllDeleted<Order>().Select(ToDTO));
        }

        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreOrder(int id)
        {
            await repo.Restore<Order>(id);
            await repo.Save();

            return Ok();
        }

        // ===================== Helpers =====================

        private Order? LoadOrder(int id) =>
            db.Orders
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Include(o => o.Customer).ThenInclude(c => c!.User)
                .Include(o => o.Cashier)
                .Include(o => o.Table)
                .FirstOrDefault(o => o.Id == id);

        private static void RecalculateTotals(Order order)
        {
            order.SubTotal = order.Items.Sum(i => i.Total);
            order.Total = order.SubTotal - order.Discount + order.Tax + order.Service;
        }

        private void DeductStock(OrderItem item, string userId)
        {
            var product = repo.Get<Product>(item.ProductId);
            if (product?.Ingredients == null)
            {
                return;
            }

            foreach (var pi in product.Ingredients)
            {
                repo.Add(new StockTransaction
                {
                    IngredientId = pi.IngredientId,
                    Type = StockTransactionType.Sale,
                    Quantity = pi.Quantity * item.Quantity,
                    ReferenceId = item.OrderId,
                    UserId = userId,
                    Notes = $"Sale from order {item.OrderId}"
                });
            }
        }

        private void RestoreStock(OrderItem item, string userId)
        {
            var product = repo.Get<Product>(item.ProductId);
            if (product?.Ingredients == null)
            {
                return;
            }

            foreach (var pi in product.Ingredients)
            {
                repo.Add(new StockTransaction
                {
                    IngredientId = pi.IngredientId,
                    Type = StockTransactionType.Return,
                    Quantity = pi.Quantity * item.Quantity,
                    ReferenceId = item.OrderId,
                    UserId = userId,
                    Notes = $"Return from order {item.OrderId}"
                });
            }
        }

        private void ReleaseTable(Order order)
        {
            if (order.TableId == 0)
            {
                return;
            }

            var table = db.CafeTables.FirstOrDefault(t => t.Id == order.TableId);
            if (table != null)
            {
                table.IsOccupied = false;
            }
        }

        private static OrderDTO ToDTO(Order o)
        {
            return new OrderDTO
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.User?.FullName,
                CashierId = o.CashierId,
                CashierName = o.Cashier?.FullName,
                TableId = o.TableId == 0 ? null : o.TableId,
                TableName = o.Table?.Name,
                OrderType = o.OrderType.ToString(),
                Status = o.Status.ToString(),
                SubTotal = o.SubTotal,
                Discount = o.Discount,
                Tax = o.Tax,
                Service = o.Service,
                Total = o.Total,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                Items = (o.Items ?? []).Select(i => new OrderItemDTO
                {
                    Id = i.Id,
                    OrderId = i.OrderId,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Discount = i.Discount,
                    Total = i.Total,
                    Notes = i.Notes
                }).ToList()
            };
        }
    }
}
