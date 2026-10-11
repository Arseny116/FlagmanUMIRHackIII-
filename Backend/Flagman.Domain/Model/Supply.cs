using Flagman.Domain.Abstractions;
using Flagman.Domain.ValueObjects;

namespace Flagman.Domain.Model;

public sealed class Supply : Entity
{
    private readonly List<Batch> _batches = new();

    private Supply()
    {
        Number = default!;
    }

    private Supply(Guid id, string number, DateTimeOffset createdAt)
    {
        Id = id;
        Number = number;
        CreatedAt = createdAt.ToUniversalTime();
    }

    public string Number { get; private set; }

    /// <summary>Дата создания поставки (UTC). От неё отсчитывается срок годности партий.</summary>
    public DateTimeOffset CreatedAt { get; private set; }

    public IReadOnlyCollection<Batch> Batches => _batches;

    public static Supply Create(Guid id, string name, DateTimeOffset createdAt)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id продукта не задан.", nameof(id));
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new Supply(Guid.NewGuid(), name, createdAt);
    }

    public static Supply Create(string name, DateTimeOffset createdAt) => Create(name, createdAt);

    /// <summary>Каждая позиция поставки становится отдельной партией: ExpiresAt = CreatedAt + срок хранения.</summary>
    public Batch AddBatch(Product product, Quantity quantity, ShelfLife shelfLife)
    {
        var batch = new Batch(this, product, quantity, shelfLife);
        _batches.Add(batch);

        return batch;
    }
}
