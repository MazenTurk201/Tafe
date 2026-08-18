using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Tafe.DTO;
using Tafe.Models;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IConfiguration configuration;

        public AccountController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            this.userManager = userManager;
            this.configuration = configuration;
        }
        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(AppUserRegisterDTO user)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser userApp = new()
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserName = user.UserName,
                    Email = user.Email,
                    Address = user.Address
                };
                IdentityResult result = await userManager.CreateAsync(userApp, user.Password);
                if (result.Succeeded)
                {
                    return NoContent();
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }
            return BadRequest(ModelState);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(AppUserLoginDTO user)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser? userFromDB = await userManager.FindByNameAsync(user.UserName);
                if (userFromDB != null)
                {
                    bool isSuccess = await userManager.CheckPasswordAsync(userFromDB, user.Password);
                    if (isSuccess)
                    {
                        List<Claim> userClaims =
                        [
                            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                            new Claim(ClaimTypes.NameIdentifier, userFromDB.Id),
                            new Claim(ClaimTypes.Name, userFromDB.UserName!),
                            new Claim(ClaimTypes.GivenName, userFromDB.FullName),
                            new Claim(ClaimTypes.StreetAddress, userFromDB.Address),
                        ];
                        var userRole = await userManager.GetRolesAsync(userFromDB);
                        foreach (var role in userRole)
                        {
                            userClaims.Add(new Claim(ClaimTypes.Role, role));

                        }

                        SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes(configuration["JWT:SigningKey"]!));

                        SigningCredentials signingCred = new(securityKey, SecurityAlgorithms.HmacSha256);

                        DateTime expiresAt = user.RememmberMe ? DateTime.UtcNow.AddDays(7) : DateTime.UtcNow.AddHours(1);

                        JwtSecurityToken token = new (
                            audience: configuration["JWT:AudienceIP"],
                            issuer: configuration["JWT:IssuerIP"],
                            expires: expiresAt,
                            claims: userClaims,
                            signingCredentials: signingCred
                            );
                        return Ok(new
                        {
                            token = new JwtSecurityTokenHandler().WriteToken(token),
                            //expires = token.ValidTo
                            expires = expiresAt
                        });


                    }
                    ModelState.AddModelError("Username", "Username or Password Invalid );");
                }
            }
            return BadRequest(ModelState);
        }
        [HttpGet("Details")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            var roles = await userManager.GetRolesAsync(user);
            var userInfo = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.FullName,
                Roles = roles
            };
            return Ok(userInfo);
        }
        [HttpPatch]
        // [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> AddRoleToUser(string username, string roleName)
        {
            var user = await userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound();
            }
            var result = await userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                return NoContent();
            }
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
            return BadRequest(ModelState);
        }
    }
}
