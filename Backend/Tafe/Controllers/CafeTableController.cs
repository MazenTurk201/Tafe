using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CafeTablesController : ControllerBase
    {
        private readonly GenericRepo repo;

        public CafeTablesController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetCafeTables()
        {
            return Ok(repo.GetAll<CafeTable>().Where(c => !c.IsDeleted)
                .Select(c => new { c.Id, c.Name, c.Capacity, c.IsOccupied, TotalOrders = c.Orders.Select(t=>t.Total), Reservations = c.Reservations.Select(t => new{Start = t.StartTime, End = t.EndTime, Note=t.Notes}) }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost]
        public IActionResult AddCafeTables(string Name) 
        {
            repo.Add(new CafeTable { Name = Name, Capacity = 0, IsOccupied = false });
            repo.Save();
            return CreatedAtAction(nameof(GetCafeTables), new { id = repo.Get<CafeTable>(Name)!.Id });
        }
        [Authorize(Roles = "Admin, Manager, Cashier")]
        [HttpPatch]
        public IActionResult PatchCafeTables(int id, string? Name, int? Capacity, bool? IsOccupied)
        {
            var CafeTable = repo.Get<CafeTable>(id);
            if (CafeTable == null)
            {
                return NotFound();
            }

            CafeTable.Name = Name;
            CafeTable.Capacity = Capacity ?? 0;
            CafeTable.IsOccupied = IsOccupied ?? false;
            repo.Update(CafeTable);
            repo.Save();

            return Ok(CafeTable);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpDelete]
        public async Task<IActionResult> DeleteCafeTables(int id)
        {
            var CafeTable = repo.Get<CafeTable>(id);
            if (CafeTable == null)
            {
                return NotFound();
            }

            await repo.SoftDelete<CafeTable>(id);
            repo.Save();

            return Ok(CafeTable);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Deleted")]
        public IActionResult GetDeletedCafeTables()
        {
            return Ok(repo.GetAll<CafeTable>()
                .Select(c => new { c.Id, c.Name }));
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreCafeTable(int id)
        {
            var CafeTable = repo.Get<CafeTable>(id);
            if (CafeTable == null)
            {
                return NotFound();
            }

            await repo.Restore<CafeTable>(id);
            repo.Save();

            return Ok(CafeTable);
        }
    }
}
