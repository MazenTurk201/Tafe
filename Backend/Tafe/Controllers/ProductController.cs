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
            return Ok(repo.GetAll<Product>().Where(c => !c.IsDeleted)
                .Select(c => new { 
                    c.Id,
                    c.Name,
                    c.Price,
                    Categiry = $"{c.Category.Name} (Id: {c.CategoryId})",
                    c.Ingredients
                }));
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPost]
        public IActionResult AddProducts(ProductCreateDTO product) 
        {
            repo.Add(new Product { Name = product.Name, Price=product.Price, CategoryId = product.CategoryId, Ingredients = product.IngredientsId});
            repo.Save();
            return CreatedAtAction(nameof(GetProducts),
                new { id = repo.Get<Product>(product.Name)!.Id },
                repo.Get<Product>(product.Name));
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPatch]
        public IActionResult PatchProducts(ProductDTO product)
        {
            var Product = repo.Get<Product>(product.Id);
            if (Product == null)
            {
                return NotFound();
            }

            Product.Name = product.Name;
            Product.Price = product.Price;
            Product.CategoryId = product.CategoryId;
            Product.Ingredients = product.Ingredients;
            repo.Update(Product);
            repo.Save();

            return Ok(Product);
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpDelete]
        public async Task<IActionResult> DeleteProducts(int id)
        {
            var Product = repo.Get<Product>(id);
            if (Product == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<Product>(id);
            repo.Save();

            return Ok(Product);
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedProducts()
        {
            return Ok(repo.GetAll<Product>().Where(c => c.IsDeleted)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Price,
                    Categiry = $"{c.Category.Name} (Id: {c.CategoryId})",
                    c.Ingredients
                    }));
        }
        [Authorize(Roles = "Admin, MANAGER")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            var Product = repo.Get<Product>(id);
            if (Product == null)
            {
                return NotFound();
            }

            await repo.Restore<Product>(id);
            repo.Save();

            return Ok(Product);
        }
    }
}
