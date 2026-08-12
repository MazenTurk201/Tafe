using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json.Serialization;
using Tafe.DB;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // الباك كان بيقبل الـ enums أرقام فقط، لكنه بيردّ بيها نصوص
                    // فبقى في عدم توافق مع الفرونت. السطر ده بيخليه يقبل النصوص برضه.
                    options.JsonSerializerOptions.Converters.Add(
                        new JsonStringEnumConverter());
                });

            builder.Services.AddEndpointsApiExplorer();

            //builder.Services.AddSwaggerGen();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Tafé", Version = "v1", Description = "Café" });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "حط التوكن بتاعك هنا على طول من غير كلمة Bearer (Swagger هيضيفها لوحده)"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                    Array.Empty<string>()
                    }
                });
            });

            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(
                option =>
                {
                    option.Password.RequiredLength = 1;
                    option.Password.RequireDigit = false;
                    option.Password.RequireNonAlphanumeric = false;
                    option.Password.RequireUppercase = false;
                }
            ).AddEntityFrameworkStores<DBContext>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JWT:IssuerIP"],
                    ValidAudience = builder.Configuration["JWT:AudienceIP"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]!))
                };
            });

            string conString = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) 
            ? $"Data Source={builder.Configuration["DBServerIP"]};Initial Catalog=Tafe;Integrated Security=True;Encrypt=False;Trust Server Certificate=True" 
            : "Server=localhost,1433;Database=Tafe;User Id=sa;Password=Db_201201;TrustServerCertificate=True;Encrypt=True";

            builder.Services.AddDbContext<DBContext>(options =>
            {
                options.UseSqlServer(
                    conString
                );
            });

            builder.Services.AddScoped<GenericRepo>();

            builder.Services.AddCors(
                option => option.AddPolicy("AllowedPolicy", policy =>
                {
                    //policy.WithOrigins();
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                })
            );


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                    c.DefaultModelsExpandDepth(-1);
                    c.HeadContent = @"
        <style>
        /* إخفاء سكشن الـ Schemas */
        .swagger-ui .models, .version-stamp { display: none !important; }

        /* ثيم الدارك مود */
        * { color: #fff !important; }
        body { background-color: #1a1a1a !important; color: #fff !important; }
        .swagger-ui textarea { background: hsla(0,0%,100%,.1) !important; }
        .swagger-ui img { filter: invert(100%) hue-rotate(180deg); }
        .scheme-container { background-color: #1a1a1a !important; }
        .opblock-section-header { background-color: #1a1a1a !important; }
        .swagger-ui select { background-color: #1a1a1a !important; }
        .modal-ux { background-color: #1a1a1a !important; border: None; }
        input { background-color: #1a1a1a !important; }
        .auth-btn-wrapper { display: flex; align-items: center; justify-content: space-evenly !important; }
        svg { fill: #fff !important; }
        small { background-color: transparent !important; }
        .total-endpoints-badge {
            font-weight: bold;
            background-color: #009688;
            color: #fff !important;
            padding: 6px 14px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
            display: inline-block;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            user-select: none;
        }
        .total-endpoints-badge:hover {
            background-color: #26a69a;
        }
        .swagger-ui .scheme-container .schemes:not(:has(.schemes-server-container)) { justify-content: space-evenly !important; }
        </style>
        <script>
        window.addEventListener(""load"", () => {
            function updateSwaggerCounts() {
                // 1. عداد كل Tag
                document.querySelectorAll("".swagger-ui .opblock-tag-section"").forEach(section => {
                    const tagHeader = section.querySelector(""h3.opblock-tag, .opblock-tag"");
                    if (!tagHeader) return;

                    const count = section.querySelectorAll("".opblock"").length;
                    const span = tagHeader.querySelector(""a.nostyle span"") || tagHeader.querySelector(""span"");

                    if (span) {
                        if (!span.dataset.originalText) {
                            span.dataset.originalText = span.textContent.replace(/\s*\(\d+\)$/, """").trim();
                        }
                        const newText = `${span.dataset.originalText} (${count})`;
                        if (span.textContent !== newText) {
                            span.textContent = newText;
                        }
                    }
                });

                // 2. إجمالي الـ Endpoints والـ Badge
                const total = document.querySelectorAll("".swagger-ui .opblock"").length;
                if (total === 0) return;

                let badge = document.querySelector("".total-endpoints-badge"");

                if (!badge) {
                    badge = document.createElement(""div"");
                    badge.className = ""total-endpoints-badge"";
                    badge.title = ""إضغط للنسخ"";
                    badge.onclick = copyEndpoints;

                    const targetContainer = document.querySelector("".swagger-ui .schemes"") || 
                                            document.querySelector("".swagger-ui .scheme-container"") ||
                                            document.querySelector("".swagger-ui .info"");
                    if (targetContainer) {
                        targetContainer.appendChild(badge);
                    }
                }

                if (badge && !badge.dataset.copied) {
                    badge.innerHTML = `Total Endpoints: <b>${total}</b> (Click to Copy 📋)`;
                }
            }

            function copyEndpoints() {

    let result = """";

    document.querySelectorAll("".swagger-ui .opblock"").forEach(op => {

        const method = op.querySelector("".opblock-summary-method"")?.innerText.trim() ?? """";
        const path = op.querySelector("".opblock-summary-path"")?.innerText.trim() ?? """";

        result += `${method} ${path}\n`;

        // ==========================
        // Parameters
        // ==========================
        op.querySelectorAll("".parameters-container .parameters tbody tr"").forEach(row => {

            const name =
                row.querySelector("".parameter__name"")?.textContent?.trim() ||
                row.querySelector("".parameters-col_name"")?.textContent?.replace(/\s+/g, "" "").trim() ||
                """";

            const type =
                row.querySelector("".parameter__type"")?.textContent?.trim() ||
                row.querySelector("".parameters-col_description code"")?.textContent?.trim() ||
                row.querySelector(""code"")?.textContent?.trim() ||
                """";

            const required =
                row.querySelector("".parameter__name.required"") != null;

            if (name) {
                result += `    ${name} : ${type}${required ? "" (Required)"" : """"}\n`;
            }

        });

        // ==========================
        // Request Body
        // ==========================
        const bodyContainer =
            op.querySelector("".body-param"") ||
            op.querySelector("".opblock-section-request-body"") ||
            op;

        const bodyExample =
            bodyContainer.querySelector(""textarea"")?.value ||
            bodyContainer.querySelector("".highlight-code pre"")?.innerText ||
            bodyContainer.querySelector(""pre"")?.innerText ||
            bodyContainer.querySelector(""code"")?.innerText ||
            """";

        if (bodyExample.trim()) {

            result += ""\n    Request body:\n"";
            result += bodyExample.trim() + ""\n"";

        }

        result += ""--------------------------------------------------\n"";

    });

    navigator.clipboard.writeText(result);

    const badge = document.querySelector("".total-endpoints-badge"");

    if (badge) {

        badge.dataset.copied = ""true"";
        badge.innerHTML = ""Copied ✔"";

        setTimeout(() => {

            delete badge.dataset.copied;
            updateSwaggerCounts();

        }, 1200);
    }
}

            // تشغيل مرة فورية وتحديث كل ثانيتين بدون ثقل
            setTimeout(updateSwaggerCounts, 500);
            setInterval(updateSwaggerCounts, 2000);
        });
// ================================
// Swagger JWT Auto Save / Restore
// ================================
(() => {

    const STORAGE_KEY = ""swagger_jwt"";
    const SCHEME_NAME = ""Bearer"";

    // ==========================================
    // Restore JWT after Swagger UI is initialized
    // ==========================================
    const restoreTimer = setInterval(() => {

        if (!window.ui?.preauthorizeApiKey)
            return;

        clearInterval(restoreTimer);

        const token = localStorage.getItem(STORAGE_KEY);

        if (token) {

            window.ui.preauthorizeApiKey(
                SCHEME_NAME,
                token
            );

            console.log(""Swagger JWT Restored"");
        }

    }, 300);


    // ==========================================
    // Intercept Swagger API requests
    // ==========================================
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {

        const response = await originalFetch(...args);

        try {

            const requestUrl =
                args[0]?.toString()?.toLowerCase() ?? """";

            // Only inspect login response
            if (requestUrl.includes(""/login"")) {

                const clone = response.clone();

                const json = await clone.json();

                // Support different response formats
                const token =
                    json?.token ??
                    json?.accessToken ??
                    json?.jwt ??
                    json?.jwtToken ??
                    json?.data?.token ??
                    json?.data?.accessToken ??
                    null;


                if (token) {

                    // Save token
                    localStorage.setItem(
                        STORAGE_KEY,
                        token
                    );

                    console.log(""Swagger JWT Saved"");


                    // Authorize Swagger immediately
                    if (window.ui?.preauthorizeApiKey) {

                        window.ui.preauthorizeApiKey(
                            SCHEME_NAME,
                            token
                        );

                        console.log(
                            ""Swagger Authorization Updated""
                        );
                    }
                }
            }

        }
        catch (error) {

            // Ignore non-JSON responses
            // or endpoints that don't return JSON
        }


        return response;
    };

})();
</script>";
                });
                app.UseCors("AllowedPolicy");
            }

            app.UseStaticFiles();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider
                    .GetRequiredService<DBContext>();
            
                await db.Database.MigrateAsync();
            }


            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("index.html");

            
            var frontendPath = Path.GetFullPath(
                Path.Combine(
                    builder.Configuration["FrontPath"]!
                )
            );

            Process.Start(new ProcessStartInfo
            {
                FileName = "npm",
                Arguments = "run dev",
                WorkingDirectory = frontendPath,
                UseShellExecute = true
            });

            app.Run();
        }
    }
}
