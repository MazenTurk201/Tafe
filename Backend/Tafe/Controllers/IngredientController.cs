using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> GetIngredients()
        {
            return Ok(await repo.GetAll<Ingredient>().Select(u => new {
                    u.Id,
                    u.Name,
                    u.MinQuantityAlert,
                    Unit = new
                    {
                        u.UnitId,
                        u.Unit.Name
                    },
                    Quantity = u.StockTransactions.Sum(st => st.Quantity)
                    }
                ).ToListAsync()
            );
        }
        [HttpGet("Warning")]
        public async Task<IActionResult> MinQuantityAlert()
        {
            return Ok(await repo.GetAll<Ingredient>().Where(x => x.StockTransactions.Sum(st => st.Quantity) <= x.MinQuantityAlert).Select(i => new
            {
                i.Id,
                i.Name,
                Quantity = i.StockTransactions.Sum(q=>q.Quantity),
                i.MinQuantityAlert,
                Unit = i.Unit.Name,
            }).ToListAsync());
        }
        [HttpGet("Warning/Count")]
        public IActionResult MinQuantityAlertCount()
        {
            return Ok(repo.GetAll<Ingredient>().Where(x => x.StockTransactions.Sum(st => st.Quantity) <= x.MinQuantityAlert).Count());
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
        public IActionResult GetDeletedIngredientsAsync()
        {
            var deletedIngredients = repo.GetAllDeleted<Ingredient>();
            return Ok(deletedIngredients.Select(u => new { u.Id, u.Name, u.MinQuantityAlert}));
        }
    }
}
