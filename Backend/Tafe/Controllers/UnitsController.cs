using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public UnitsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetUnits()
        {
            return Ok(repo.GetAll<Unit>().Where(u => !u.IsDeleted)
                .Select(u => new { u.Id, u.Name }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public IActionResult CreateUnit(string Name)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Unit { Name = Name });
                repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteUnit(int id)
        {
            await repo.SoftDelete<Unit>(id);
            repo.Save();
            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public IActionResult PatchUnit(int id, string Name)
        {
            var unit = repo.Get<Unit>(id);
            if (unit == null)
            {
                return NotFound();
            }

            unit.Name = Name;
            repo.Update(unit);
            repo.Save();

            return Ok(unit);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreUnit(int id)
        {
            var unit = repo.Get<Unit>(id);

            await repo.Restore<Unit>(id);
            repo.Save();

            return Ok(unit);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedUnits()
        {
            return Ok(repo.GetAllDeleted<Unit>()
                .Select(u => new { u.Id, u.Name }));
        }
    }
}
