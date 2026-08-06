using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly GenericRepo repo;

        public CategoriesController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetCategories()
        {
            return Ok(repo.GetAll<Category>().Where(c => !c.IsDeleted)
                .Select(c => new { c.Id, c.Name }));
        }
        [HttpPost]
        public IActionResult PostCategories(string Name) 
        {
            repo.Add<Category>(new Category { Name = Name });
            repo.Save();
            return CreatedAtAction(nameof(GetCategories),
                new { id = repo.Get<Category>(Name)!.Id },
                repo.Get<Category>(Name));
        }
        [HttpPatch]
        public IActionResult PatchCategories(int id, string Name)
        {
            var category = repo.Get<Category>(id);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = Name;
            repo.Update(category);
            repo.Save();

            return Ok(category);
        }
        [HttpDelete]
        public IActionResult DeleteCategories(int id)
        {
            var category = repo.Get<Category>(id);
            if (category == null)
            {
                return NotFound();
            }

            repo.SoftDelete<Category>(id).Wait();
            repo.Save();

            return Ok(category);
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedCategories()
        {
            return Ok(repo.GetAll<Category>().Where(c => c.IsDeleted)
                .Select(c => new { c.Id, c.Name }));
        }
        [HttpPatch("Restore")]
        public IActionResult RestoreCategory(int id)
        {
            var category = repo.Get<Category>(id);
            if (category == null)
            {
                return NotFound();
            }

            repo.Restore<Category>(id).Wait();
            repo.Save();

            return Ok(category);
        }
    }
}
