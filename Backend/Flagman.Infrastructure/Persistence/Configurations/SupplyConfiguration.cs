using Flagman.Domain.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flagman.Infrastructure.Persistence.Configurations;

internal sealed class SupplyConfiguration : IEntityTypeConfiguration<Supply>
{
    public void Configure(EntityTypeBuilder<Supply> builder)
    {
        builder.ToTable("Supplies");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.Number).IsRequired().HasMaxLength(64);
        builder.HasIndex(s => s.Number).IsUnique();

        builder.Property(s => s.CreatedAt).IsRequired();

        builder.Navigation(s => s.Batches).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
