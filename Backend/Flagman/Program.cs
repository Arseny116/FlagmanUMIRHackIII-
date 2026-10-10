using Flagman.Application.Abstractions.Services;
using Flagman.Application.Services;
using Flagman.Endpoints;
using Flagman.Domain.Abstractions;
using Flagman.Infrastructure.Persistence;
using Flagman.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("FlagmanDb"));
builder.Services.AddScoped<IDishRepository, DishRepository>();
builder.Services.AddScoped<IRecipeItemRepository, RecipeItemRepository>();
builder.Services.AddScoped<IDishService, DishService>();
builder.Services.AddScoped<IRecipeItemService, RecipeItemService>();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{

    app.MapOpenApi();

  
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
   
}

app.UseHttpsRedirection();


app.MapDishEndpoints();
app.MapRecipeItemEndpoints();

app.Run();
