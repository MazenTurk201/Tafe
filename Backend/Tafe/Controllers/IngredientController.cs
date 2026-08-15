using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public IngredientsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetIngredients()
        {
            return Ok(repo.GetAll<Ingredient>().Where(u => !u.IsDeleted)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.MinQuantityAlert,
                    Unit = new
                    {
                        u.UnitId,
                        u.Unit.Name
                    },
                    Quantity = u.Quantity
                        + u.StockTransactions.Where(st => 
                            st.Type == StockTransactionType.Purchase ||
                            st.Type == StockTransactionType.Return
                        ).Sum(st => st.Quantity)
                        - u.StockTransactions.Where(st => 
                            st.Type == StockTransactionType.Sale || 
                            st.Type == StockTransactionType.Waste || 
                            st.Type == StockTransactionType.Adjustment
                        ).Sum(st => st.Quantity)
                    }
                )
            );
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public async Task<IActionResult> CreateIngredient(IngredientDTO ingredientCreate)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Ingredient { Name = ingredientCreate.Name, MinQuantityAlert = ingredientCreate.MinQuantityAlert, UnitId = ingredientCreate.UnitId });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteIngredient(int id)
        {
            await repo.SoftDelete<Ingredient>(id);
            await repo.Save();
            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public async Task<IActionResult> PatchIngredient(IngredientDTO ingredientDTO)
        {
            var Ingredient = repo.Get<Ingredient>(ingredientDTO.Id);
            if (Ingredient == null)
            {
                return NotFound();
            }

            Ingredient.Name = ingredientDTO.Name;
            Ingredient.Quantity = ingredientDTO.Quantity;
            Ingredient.MinQuantityAlert = ingredientDTO.MinQuantityAlert;
            Ingredient.UnitId = ingredientDTO.UnitId;
            await repo.Update(Ingredient);
            await repo.Save();

            return Ok(Ingredient);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreIngredient(int id)
        {
            await repo.Restore<Ingredient>(id);
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedIngredients()
        {
            return Ok(repo.GetAllDeleted<Ingredient>()
                .Select(u => new { u.Id, u.Name }));
        }
    }
}
