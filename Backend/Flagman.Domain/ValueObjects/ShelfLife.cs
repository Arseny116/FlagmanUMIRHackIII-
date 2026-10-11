namespace Flagman.Domain.ValueObjects;

/// <summary> Срок хранения продукта (в часах, строго положительный).</summary>
public readonly record struct ShelfLife
{
    private ShelfLife(int hours) => Hours = hours;

    public int Hours { get; }

    public TimeSpan Duration => TimeSpan.FromHours(Hours);

    public static ShelfLife FromHours(int hours)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(hours);

        return new ShelfLife(hours);
    }


    /// <summary>Дата истечения срока для партии, поступившей в момент <paramref name="receivedAt"/>.</summary>
    public DateTimeOffset ExpiresAt(DateTimeOffset receivedAt) => receivedAt + Duration;
}
