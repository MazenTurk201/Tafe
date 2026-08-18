using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController(GenericRepo repo) : ControllerBase
    {
        private readonly GenericRepo repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetMenu()
        {
            return Ok(await repo.GetAll<Category>()
                .Select(c => new {
                    c.Id,
                    c.Name,
                    Products = c.Products
                        .Where(p => !p.IsDeleted)
                        .Select(p => new {
                            p.Id,
                            p.Name,
                            p.Price,
                            Ingredients = p.Ingredients.Select(i => new {
                                i.IngredientId,
                                i.Ingredient.Name,
                                i.Quantity,
                                Unit = i.Ingredient.Unit.Name
                            })
                        })
                    }
                ).ToListAsync()
            );
        }
    }
}
