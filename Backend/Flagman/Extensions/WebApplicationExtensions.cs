using Flagman.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Flagman.Extensions;


public static class WebApplicationExtensions
{
    /// <summary>Применяет миграции EF Core при старте.</summary>
    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.MigrateAsync();
    }
}
