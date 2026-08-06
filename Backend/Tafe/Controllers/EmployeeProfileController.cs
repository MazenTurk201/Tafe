using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly UserManager<ApplicationUser> userManager;

        public EmployeeProfileController(GenericRepo repo, UserManager<ApplicationUser> userManager)
        {
            this.repo = repo;
            this.userManager = userManager;
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
                repo.Add<EmployeeProfile>(new EmployeeProfile { UserId = appUser.Id, Salary = employeeCreateDTO.Salary, HireDate = employeeCreateDTO.HireDate, IsActive = true, User = appUser });
                await userManager.AddToRoleAsync(appUser, "WAITER");
                repo.Save();
                return CreatedAtAction(nameof(GetEmployeeProfiles), new { id = appUser.Id }, null);
            }
            return BadRequest(ModelState);
        }
        [HttpPatch]
        public IActionResult UpdateEmployeeProfile(EmployeeProfileUpdateDTO employeeProfileUpdateDTO)
        {
            EmployeeProfile? profile = repo.GetP<EmployeeProfile>(employeeProfileUpdateDTO.UserId);
            if (profile != null)
            {
                profile.Salary = employeeProfileUpdateDTO.Salary;
                profile.HireDate = employeeProfileUpdateDTO.HireDate;
                profile.IsActive = employeeProfileUpdateDTO.IsActive;
                repo.Update<EmployeeProfile>(profile);
                repo.Save();
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
                repo.Save();
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
                repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
