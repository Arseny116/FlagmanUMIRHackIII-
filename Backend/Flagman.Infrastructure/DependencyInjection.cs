using Flagman.Domain.Abstractions;
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
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Не задана строка подключения ConnectionStrings:Postgres.");

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISupplyRepository, SupplyRepository>();
        services.AddScoped<IBatchRepository, BatchRepository>();

        return services;
    }
}
