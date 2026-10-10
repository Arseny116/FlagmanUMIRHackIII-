using Flagman.Domain.Model;
using Flagman.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Flagman.Infrastructure.Persistence.Configurations;

internal sealed class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    private static readonly ValueConverter<Quantity, decimal> QuantityConverter =
        new(q => q.Value, v => Quantity.From(v));

    private static readonly ValueConverter<ShelfLife, int> ShelfLifeConverter =
        new(s => s.Hours, v => ShelfLife.FromHours(v));

    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("Batches", t =>
            t.HasCheckConstraint(
                "CK_Batches_RemainingQuantity",
                "\"RemainingQuantity\" >= 0 AND \"RemainingQuantity\" <= \"InitialQuantity\""));

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).ValueGeneratedNever();

        builder.Property(b => b.InitialQuantity)
            .HasConversion(QuantityConverter)
            .HasColumnType("numeric(18,3)")
            .IsRequired();

        builder.Property(b => b.RemainingQuantity)
            .HasConversion(QuantityConverter)
            .HasColumnType("numeric(18,3)")
            .IsRequired();

        builder.Property(b => b.ShelfLife)
            .HasConversion(ShelfLifeConverter)
            .HasColumnName("ShelfLifeHours")
            .IsRequired();

        builder.Property(b => b.ReceivedAt).IsRequired();
        builder.Property(b => b.ExpiresAt).IsRequired();

        builder.HasOne(b => b.Supply)
            .WithMany(s => s.Batches)
            .HasForeignKey(b => b.SupplyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Product)
            .WithMany()
            .HasForeignKey(b => b.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // FEFO: быстро находить партии продукта по ближайшему сроку.
        builder.HasIndex(b => new { b.ProductId, b.ExpiresAt });
        builder.HasIndex(b => b.ExpiresAt);
    }
}
