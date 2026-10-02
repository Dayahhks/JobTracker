using JobTracker.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization;
using JobTracker.Api.Services;
using Scalar.AspNetCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options=>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// replace builder.Services.AddControllers(); with:
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddScoped<IJobApplicationService, JobApplicationService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();

}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
