using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Tafe.Controllers
{
    //[Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> role;

        public RoleController(RoleManager<IdentityRole> role)
        {
            this.role = role;
        }
        [HttpPost]
        public async Task<IActionResult> SaveRole(string roleName)
        {
            if (ModelState.IsValid)
            {
                IdentityRole identityRole = new();
                identityRole.Name = roleName;
                IdentityResult identityResult = await role.CreateAsync(identityRole);
                if (identityResult.Succeeded)
                {
                    return Ok();
                }
                foreach (var error in identityResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }
            return BadRequest(ModelState);
        }
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            return Ok(role.Roles.ToList());
        }

    }
}
