using Azure.Core.Pipeline;
using Microsoft.AspNetCore.Http;
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
        [HttpPost]
        public IActionResult CreateUnit(string Name)
        {
            if (ModelState.IsValid)
            {
                repo.Add<Unit>(new Unit { Name = Name });
                repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public IActionResult DeleteUnit(int id)
        {
            repo.SoftDelete<Unit>(id).Wait();
            repo.Save();
            return Ok();
        }
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
        [HttpPatch("Restore")]
        public IActionResult RestoreUnit(int id)
        {
            var unit = repo.Get<Unit>(id);

            repo.Restore<Unit>(id).Wait();
            repo.Save();

            return Ok(unit);
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedUnits()
        {
            return Ok(repo.GetAllDeleted<Unit>()
                .Select(u => new { u.Id, u.Name }));
        }
    }
}
