using Flagman.Domain.Abstractions;
using Flagman.Application.Abstractions;
using Flagman.Application.Abstractions.Services;
using Flagman.Application.Services;
using Flagman.Infrastructure.Persistence;
using Flagman.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace Flagman.Infrastructure;


public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres");

        services.AddDbContext<AppDbContext>(options =>
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                options.UseInMemoryDatabase("FlagmanDb");
            else
                options.UseNpgsql(connectionString);
        });
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISupplyRepository, SupplyRepository>();
        services.AddScoped<IBatchRepository, BatchRepository>();
        services.AddScoped<IDishRepository, DishRepository>();
        services.AddScoped<IRecipeItemRepository, RecipeItemRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IDishService, DishService>();
        services.AddScoped<IRecipeItemService, RecipeItemService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IExpiringService, ExpiringService>();

        return services;
    }
}
