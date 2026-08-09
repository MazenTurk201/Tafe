using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public InventoryCountController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetInventoryCounts()
        {
            return Ok(repo.GetAll<InventoryCount>().Where(ic => !ic.IsDeleted)
                .Select(ic => new { ic.Id, ic.Name }));
        }
        [HttpPost]
        public IActionResult CreateInventoryCount(InventoryCountCreateDTO inventoryCount)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new InventoryCount { 
                    Name = DateTime.Now.ToString("yyyyMMddHHmmssfff"), 
                    IngredientId = inventoryCount.IngredientId, 
                    ActualQuantity = inventoryCount.Quantity, 
                    UserId = inventoryCount.UserId, 
                    Notes = inventoryCount.Notes, 
                    SystemQuantity = repo.Get<Ingredient>(inventoryCount.IngredientId)!.Quantity
                });
                StockTransaction stockTransaction = new()
                {
                    IngredientId = inventoryCount.IngredientId,
                    Type = inventoryCount.Type,
                    Quantity = inventoryCount.Quantity,
                    UserId = inventoryCount.UserId,
                    Notes = inventoryCount.Notes
                };
                repo.Add(stockTransaction);
                repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteInventoryCount(int id)
        {
            await repo.SoftDelete<InventoryCount>(id);
            repo.Save();
            return Ok();
        }
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreInventoryCount(int id)
        {
            var inventoryCount = repo.Get<InventoryCount>(id);

            await repo.Restore<InventoryCount>(id);
            repo.Save();

            return Ok(inventoryCount);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedInventoryCounts()
        {
            return Ok(repo.GetAllDeleted<InventoryCount>()
                .Select(ic => new { ic.Id, ic.Name }));
        }
    }
}
