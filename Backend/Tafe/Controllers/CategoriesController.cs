using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public async Task<IActionResult> AddCategories(string Name) 
        {
            repo.Add(new Category { Name = Name });
            await repo.Save();
            return CreatedAtAction(nameof(GetCategories), new { id = repo.Get<Category>(Name)!.Id });
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public async Task<IActionResult> PatchCategories(int id, string Name)
        {
            var category = repo.Get<Category>(id);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = Name;
            await repo.Update(category);
            await repo.Save();

            return Ok(category);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteCategories(int id)
        {
            var category = repo.Get<Category>(id);
            if (category == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<Category>(id);
            await repo.Save();

            return Ok(category);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedCategories()
        {
            return Ok(repo.GetAll<Category>()
                .Select(c => new { c.Id, c.Name }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreCategory(int id)
        {
            await repo.Restore<Category>(id);
            await repo.Save();

            return Ok();
        }
    }
}
