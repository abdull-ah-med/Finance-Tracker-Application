using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
    };
    
    // Configure to read JWT token from both Authorization header and cookies
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Check if token is in Authorization header first
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            // If not in header, check cookies
            if (string.IsNullOrEmpty(token))
            {
                token = context.Request.Cookies["auth_token"];
            }
            
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
    
    options.AddPolicy("AllowCredentials", builder =>
    {
        builder.WithOrigins("http://localhost:5173", "http://localhost:3000") // Frontend URLs
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials(); // Allow cookies
    });
});
builder.Services.AddControllers();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowCredentials"); // Use the policy that allows credentials
app.MapControllers();
app.Run();