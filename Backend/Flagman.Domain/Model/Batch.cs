using Flagman.Domain.Abstractions;
using Flagman.Domain.ValueObjects;

namespace Flagman.Domain.Model;

public sealed class Batch : Entity
{
    private Batch()
    {
        Supply = default!;
        Product = default!;
    }

    internal Batch(Supply supply, Product product, Quantity quantity, ShelfLife shelfLife)
    {
        if (quantity.IsZero)
            throw new ArgumentOutOfRangeException(nameof(quantity), "Количество в партии должно быть больше нуля.");

        Id = Guid.NewGuid();
        Supply = supply;
        SupplyId = supply.Id;
        Product = product;
        ProductId = product.Id;
        InitialQuantity = quantity;
        RemainingQuantity = quantity;
        ShelfLife = shelfLife;
        ReceivedAt = supply.CreatedAt;
        ExpiresAt = shelfLife.ExpiresAt(ReceivedAt);
    }


    public Guid SupplyId { get; private set; }
    public Supply Supply { get; private set; }

    public Guid ProductId { get; private set; }
    public Product Product { get; private set; }

    public Quantity InitialQuantity { get; private set; }
    public Quantity RemainingQuantity { get; private set; }

    public ShelfLife ShelfLife { get; private set; }

    public DateTimeOffset ReceivedAt { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }

    public bool IsExpired(DateTimeOffset now) => ExpiresAt <= now;

    public TimeSpan TimeLeft(DateTimeOffset now) => ExpiresAt - now;
}
