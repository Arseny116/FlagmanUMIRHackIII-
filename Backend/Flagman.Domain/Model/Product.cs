using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model;

public sealed class Product : Entity
{
    private Product()
    {
        Name = default!;
        Unit = default!;
    }

    private Product(Guid id, string name, string unit)
    {
        Id = id;
        Name = name;
        Unit = unit;
    }

    public static Product Create(string name, string unit)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        return new Product(Guid.NewGuid(), name, unit);
    }

    public string Name { get; private set; }

    /// <summary>Единица измерения (кг, л, шт...).</summary>
    public string Unit { get; private set; }
}
