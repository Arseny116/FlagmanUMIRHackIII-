using Flagman.Domain.Model.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flagman.Infrastructure.Persistence.Configurations;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(order => order.Id);
        builder.Property(order => order.Id).ValueGeneratedNever();

        builder.Property(order => order.CreatedAt).IsRequired();
        builder.Property(order => order.Status).IsRequired();

        builder.HasMany(order => order.Items)
            .WithOne(item => item.Order)
            .HasForeignKey(item => item.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();

        builder.Property(item => item.Quantity)
            .HasColumnType("numeric(18,3)")
            .IsRequired();

        builder.HasOne(item => item.Dish)
            .WithMany()
            .HasForeignKey(item => item.DishId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(item => new { item.OrderId, item.DishId })
            .IsUnique();
    }
}