using Flagman.Domain.Model.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flagman.Infrastructure.Persistence.Configurations;

internal sealed class OrderBatchConsumptionConfiguration
    : IEntityTypeConfiguration<OrderBatchConsumption>
{
    public void Configure(EntityTypeBuilder<OrderBatchConsumption> builder)
    {
        builder.ToTable("OrderBatchConsumptions");

        builder.HasKey(consumption => consumption.Id);
        builder.Property(consumption => consumption.Id).ValueGeneratedNever();

        builder.Property(consumption => consumption.Quantity)
            .HasColumnType("numeric(18,3)")
            .IsRequired();

        builder.HasOne(consumption => consumption.Order)
            .WithMany()
            .HasForeignKey(consumption => consumption.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(consumption => consumption.Batch)
            .WithMany()
            .HasForeignKey(consumption => consumption.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(consumption => new
        {
            consumption.OrderId,
            consumption.BatchId,
            consumption.ProductId
        });
    }
}