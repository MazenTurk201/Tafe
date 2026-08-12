using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public ProductsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(
                repo.GetAll<Product>()
                    .Select(c => new { 
                        c.Id,
                        c.Name,
                        c.Price,
                        Categiry = $"{c.Category.Name} (Id: {c.CategoryId})",
                        Ingredients = c.Ingredients.Select(i => new { i.Ingredient.Id, i.Ingredient.Name, Unit = i.Ingredient.Unit.Name, i.Quantity })
                }
            ));
        }
        [HttpGet("Search")]
        public IActionResult SearchProducts(string Name)
        {
            return Ok(
                repo.Search<Product>(Name)
                    .Select(c => new { 
                        c.Id,
                        c.Name,
                        c.Price,
                        Category = $"{c.Category.Name} (Id: {c.CategoryId})",
                        Ingredients = c.Ingredients.Select(i => new { i.Ingredient.Id, i.Ingredient.Name, Unit = i.Ingredient.Unit.Name, i.Quantity })
                }
            ));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public async Task<IActionResult> AddProducts(ProductCreateDTO product) 
        {
            repo.Add(new Product { Name = product.Name, Price=product.Price, CategoryId = product.CategoryId});
            await repo.Save();
            return CreatedAtAction(nameof(GetProducts), new { id = repo.Get<Product>(product.Name)!.Id });
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public async Task<IActionResult> PatchProducts(ProductDTO product)
        {
            var Product = repo.Get<Product>(product.Id);
            if (Product == null)
            {
                return NotFound();
            }

            Product.Name = product.Name;
            Product.Price = product.Price;
            Product.CategoryId = product.CategoryId;
            await repo.Update(Product);
            await repo.Save();

            return Ok(Product);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteProducts(int id)
        {
            var Product = repo.Get<Product>(id);
            if (Product == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<Product>(id);
            await repo.Save();

            return Ok(Product);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedProducts()
        {
            return Ok(repo.GetAll<Product>()
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Price,
                    Categiry = $"{c.Category.Name} (Id: {c.CategoryId})",
                    c.Ingredients
                    }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            await repo.Restore<Product>(id);
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPut("AddIngredient")]
        public async Task<IActionResult> AddIngredientToProduct(int ProductId, int IngredientId, decimal Quantity)
        {
            var Product = repo.Get<Product>(ProductId);
            if (Product == null)
            {
                return NotFound("Product not found.");
            }
            
            var Ingredient = repo.Get<Ingredient>(IngredientId);
            if (Ingredient == null)
            {
                return NotFound("Ingredient not found.");
            }

            var exists = repo.GetAll<ProductIngredient>() .Any(x => x.ProductId == ProductId && x.IngredientId == IngredientId);
            if (exists)
            { 
                return Conflict("This ingredient already exists in this product.");
            }
            
            repo.Add(new ProductIngredient { IngredientId = IngredientId, ProductId = ProductId, Quantity = Quantity });
            await repo.Save();

            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete("RemoveIngredient")]
        public async Task<IActionResult> RemoveIngredientFromProduct(int ProductId, int IngredientId)
        {
            var Product = repo.Get<Product>(ProductId);
            if (Product == null)
            {
                return NotFound("Product not found.");
            }
            
            var Ingredient = repo.Get<Ingredient>(IngredientId);
            if (Ingredient == null)
            {
                return NotFound("Ingredient not found.");
            }

            ProductIngredient ProductIngredient = repo.GetAll<ProductIngredient>().FirstOrDefault(x => x.ProductId == ProductId && x.IngredientId == IngredientId)!;
            if (ProductIngredient == null)
            { 
                return NotFound("This ingredient is not part of this product.");
            }
            
            repo.Delete(ProductIngredient);
            await repo.Save();

            return Ok();
        }
    }
}
