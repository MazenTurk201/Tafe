using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Authorize(Roles = "Admin, Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;

        public EmployeeProfileController(GenericRepo repo, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            this.repo = repo;
            this.userManager = userManager;
            this.roleManager = roleManager;
        }
        [HttpGet]
        public IActionResult GetEmployeeProfiles()
        {
            var employeeProfiles = repo.GetAll<EmployeeProfile>().Where(e => !e.User.IsDeleted);

            return Ok(employeeProfiles.Select(e => new EmployeeProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Salary = e.Salary,
                HireDate = e.HireDate,
                IsActive = e.IsActive
            }));
        }
        [HttpGet("{userId}")]
        public IActionResult GetEmployeeProfileById(string userId)
        {
            var employeeProfile = repo.GetP<EmployeeProfile>(userId);

            if (employeeProfile == null || employeeProfile.User.IsDeleted)
            {
                return NotFound();
            }

            var employeeProfileDTO = new EmployeeProfileDTO
            {
                UserId = employeeProfile.UserId,
                UserName = employeeProfile.User.UserName,
                FullName = employeeProfile.User.FullName,
                Email = employeeProfile.User.Email,
                Salary = employeeProfile.Salary,
                HireDate = employeeProfile.HireDate,
                IsActive = employeeProfile.IsActive
            };

            return Ok(employeeProfileDTO);
        }
        [HttpGet("Search/{searchTerm}")]
        public IActionResult SearchEmployeeProfiles(string searchTerm)
        {
            var employeeProfiles = repo.GetAll<EmployeeProfile>()
                .Where(e => !e.User.IsDeleted &&
                            (e.User.UserName!.Contains(searchTerm) ||
                             e.User.FirstName.Contains(searchTerm) ||
                             e.User.LastName.Contains(searchTerm)));

            return Ok(employeeProfiles.Select(e => new EmployeeProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Salary = e.Salary,
                HireDate = e.HireDate,
                IsActive = e.IsActive
            }));
        }
        [HttpPost]
        public async Task<IActionResult> CreateEmployeeProfile(EmployeeCreateDTO employeeCreateDTO)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser appUser = new ApplicationUser
                {
                    UserName = employeeCreateDTO.User.UserName,
                    Email = employeeCreateDTO.User.Email,
                    FirstName = employeeCreateDTO.User.FirstName,
                    LastName = employeeCreateDTO.User.LastName,
                    CreatedAt = DateTime.Now
                };
                var result = await userManager.CreateAsync(appUser, employeeCreateDTO.User.Password);

                if (!result.Succeeded) { return BadRequest(result.Errors); }
                repo.Add(new EmployeeProfile { UserId = appUser.Id, Salary = employeeCreateDTO.Salary, HireDate = employeeCreateDTO.HireDate, IsActive = true, User = appUser });
                var role = await roleManager.FindByNameAsync(employeeCreateDTO.RoleName);
                if (role == null)
                    return BadRequest("Role not found.");
                await userManager.AddToRoleAsync(appUser, employeeCreateDTO.RoleName);
                await repo.Save();
                return CreatedAtAction(nameof(GetEmployeeProfiles), new { id = appUser.Id }, null);
            }
            return BadRequest(ModelState);
        }
        [HttpPatch]
        public async Task<IActionResult> UpdateEmployeeProfile(EmployeeProfileUpdateDTO employeeProfileUpdateDTO)
        {
            EmployeeProfile? profile = repo.GetP<EmployeeProfile>(employeeProfileUpdateDTO.UserId);
            if (profile != null)
            {
                profile.Salary = employeeProfileUpdateDTO.Salary;
                profile.HireDate = employeeProfileUpdateDTO.HireDate;
                profile.IsActive = employeeProfileUpdateDTO.IsActive;
                await repo.Update(profile);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedEmployeeProfiles()
        {
            var employeeProfiles = repo.GetAll<EmployeeProfile>().Where(e => e.User.IsDeleted);

            return Ok(employeeProfiles.Select(e => new EmployeeProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Salary = e.Salary,
                HireDate = e.HireDate,
                IsActive = e.IsActive
            }));
        }
        [HttpDelete("{userName}")]
        public async Task<IActionResult> DeleteEmployeeProfile(string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null)
            {
                user.IsDeleted = true;
                await userManager.UpdateAsync(user);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
        [HttpPatch("Restore/{userName}")]
        public async Task<IActionResult> RestoreEmployeeProfile(string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null)
            {
                user.IsDeleted = false;
                await userManager.UpdateAsync(user);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
