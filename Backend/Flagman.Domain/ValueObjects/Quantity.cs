namespace Flagman.Domain.ValueObjects;

/// <summary>Неотрицательное количество продукта.</summary>
public readonly record struct Quantity
{
    private Quantity(decimal value) => Value = value;

    public decimal Value { get; }

    public static Quantity Zero => new(0m);

    public bool IsZero => Value == 0m;

    public static Quantity From(decimal value)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(value);

        return new Quantity(value);
    }

    public override string ToString() => Value.ToString(System.Globalization.CultureInfo.InvariantCulture);
}
