using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tafe.DB;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin, Manager")]
    [ApiController]
    public class InventoryCountController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly DBContext db;

        public InventoryCountController(GenericRepo repo, DBContext db)
        {
            this.repo = repo;
            this.db = db;
        }
        [HttpGet]
        public async Task<IActionResult> GetInventoryCounts()
        {
            return Ok(await repo.GetAll<InventoryCount>().Where(ic => !ic.IsDeleted)
                .Select(ic => new { ic.Id, ic.Name, ic.ActualQuantity, ic.Difference, ic.SystemQuantity, ic.User.FullName, ic.Notes }).ToListAsync());
        }
        [HttpPost]
        public async Task<IActionResult> CreateInventoryCount(InventoryCountCreateDTO inventoryCount)
        {
            if (ModelState.IsValid)
            {
                var cashierId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(cashierId))
                {
                    return Unauthorized();
                }

                var cashier = db.Set<ApplicationUser>()
                    .FirstOrDefault(c => c.Id == cashierId);

                if (cashier == null)
                {
                    return Unauthorized();
                }

                var SystemQuantity = await repo.GetStockQuantity(inventoryCount.IngredientId);
                var difference = inventoryCount.Quantity - SystemQuantity;

                repo.Add(new InventoryCount { 
                    Name = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff"), 
                    IngredientId = inventoryCount.IngredientId, 
                    ActualQuantity = inventoryCount.Quantity,
                    UserId = cashier.Id,
                    Notes = inventoryCount.Notes, 
                    SystemQuantity = SystemQuantity,
                    Difference = difference,
                });

                if (difference != 0)
                {
                    StockTransaction stockTransaction = new()
                    {
                        IngredientId = inventoryCount.IngredientId,
                        Type = StockTransactionType.Adjustment,
                        Quantity = difference,
                        UserId = cashier.Id,
                        Notes = inventoryCount.Notes
                    };
                    repo.Add(stockTransaction);
                }
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteInventoryCount(int id)
        {
            await repo.SoftDelete<InventoryCount>(id);
            await repo.Save();
            return Ok();
        }
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreInventoryCount(int id)
        {
            await repo.Restore<InventoryCount>(id);
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public async Task<IActionResult> GetDeletedInventoryCounts()
        {
            return Ok(await repo.GetAllDeleted<InventoryCount>().Select(ic => new { ic.Id, ic.Name, ic.ActualQuantity, ic.Difference, ic.SystemQuantity, ic.User.FullName, ic.Notes }).ToListAsync());
        }
    }
}
