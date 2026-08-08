using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
                    u.Quantity,
                    u.MinQuantityAlert,
                    Unit = $"{u.Unit.Name} (Id: {u.UnitId})"
                    }));
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPost]
        public IActionResult CreateIngredient(string Name, decimal Quantity, decimal MinQuantityAlert, int UnitId)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Ingredient { Name = Name, Quantity = Quantity, MinQuantityAlert = MinQuantityAlert, UnitId = UnitId });
                repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpDelete]
        public async Task<IActionResult> DeleteIngredient(int id)
        {
            await repo.SoftDelete<Ingredient>(id);
            repo.Save();
            return Ok();
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPatch]
        public IActionResult PatchIngredient(int id, string? Name, decimal Quantity, decimal MinQuantityAlert, int UnitId)
        {
            var Ingredient = repo.Get<Ingredient>(id);
            if (Ingredient == null)
            {
                return NotFound();
            }

            Ingredient.Name = Name;
            Ingredient.Quantity = Quantity;
            Ingredient.MinQuantityAlert = MinQuantityAlert;
            Ingredient.UnitId = UnitId;
            repo.Update(Ingredient);
            repo.Save();

            return Ok(Ingredient);
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreIngredient(int id)
        {
            var Ingredient = repo.Get<Ingredient>(id);

            await repo.Restore<Ingredient>(id);
            repo.Save();

            return Ok(Ingredient);
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedIngredients()
        {
            return Ok(repo.GetAllDeleted<Ingredient>()
                .Select(u => new { u.Id, u.Name }));
        }
    }
}
