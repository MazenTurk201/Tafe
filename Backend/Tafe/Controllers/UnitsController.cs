using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> GetUnits()
        {
            return Ok(await repo.GetAll<Unit>()
                .Select(u => new { u.Id, u.Name }).ToListAsync());
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public async Task<IActionResult> CreateUnit(string Name)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Unit { Name = Name });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteUnit(int id)
        {
            await repo.SoftDelete<Unit>(id);
            await repo.Save();
            return Ok();
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch]
        public async Task<IActionResult> PatchUnit(int id, string Name)
        {
            var unit = repo.Get<Unit>(id);
            if (unit == null)
            {
                return NotFound();
            }

            unit.Name = Name;
            await repo.Update(unit);
            await repo.Save();

            return Ok(unit);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreUnit(int id)
        {
            var unit = repo.Get<Unit>(id);

            await repo.Restore<Unit>(id);
            await repo.Save();

            return Ok(unit);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public async Task<IActionResult> GetDeletedUnits()
        {
            return Ok(await repo.GetAllDeleted<Unit>()
                .Select(u => new { u.Id, u.Name }).ToListAsync());
        }
    }
}
