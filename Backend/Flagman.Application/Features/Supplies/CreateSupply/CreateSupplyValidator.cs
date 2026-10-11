namespace Flagman.Application.Features.Supplies.CreateSupply;

internal static class CreateSupplyValidator
{
    public const int MaxNumberLength = 64;
    public const int MaxNameLength = 200;
    public const int MaxUnitLength = 16;
    public const int MaxShelfLifeHours = 24 * 365 * 10;
    public const decimal MaxQuantity = 1_000_000_000m;

    public static Dictionary<string, string[]> Validate(CreateSupplyCommand command)
    {
        var errors = new Dictionary<string, List<string>>();

        void Add(string key, string message)
        {
            if (!errors.TryGetValue(key, out var list))
                errors[key] = list = new List<string>();
            list.Add(message);
        }

        if (command.Id == Guid.Empty)
            Add("id", "Идентификатор поставки обязателен.");

        if (string.IsNullOrWhiteSpace(command.Number))
            Add("number", "Номер поставки обязателен.");
        else if (command.Number.Trim().Length > MaxNumberLength)
            Add("number", $"Номер поставки не длиннее {MaxNumberLength} символов.");

        if (command.Items is null || command.Items.Count == 0)
        {
            Add("items", "Поставка должна содержать хотя бы один продукт.");
        }
        else
        {
            for (var i = 0; i < command.Items.Count; i++)
            {
                var item = command.Items[i];
                var path = $"items[{i}]";

                if (item is null)
                {
                    Add(path, "Позиция поставки не задана.");
                    continue;
                }

                if (item.ProductId == Guid.Empty)
                    Add($"{path}.productId", "Идентификатор продукта обязателен.");

                if (string.IsNullOrWhiteSpace(item.Name))
                    Add($"{path}.name", "Название продукта обязательно.");
                else if (item.Name.Trim().Length > MaxNameLength)
                    Add($"{path}.name", $"Название не длиннее {MaxNameLength} символов.");

                if (item.Quantity <= 0m)
                    Add($"{path}.quantity", "Количество должно быть больше нуля.");
                else if (item.Quantity > MaxQuantity)
                    Add($"{path}.quantity", $"Количество не больше {MaxQuantity:N0}.");
                else if (decimal.Round(item.Quantity, 3) != item.Quantity)
                    Add($"{path}.quantity", "Допустимо не более 3 знаков после запятой.");

                if (item.ShelfLifeHours <= 0)
                    Add($"{path}.shelfLifeHours", "Срок хранения должен быть больше нуля (в часах).");
                else if (item.ShelfLifeHours > MaxShelfLifeHours)
                    Add($"{path}.shelfLifeHours", $"Срок хранения не больше {MaxShelfLifeHours} часов.");

                if (item.Unit is not null && item.Unit.Trim().Length > MaxUnitLength)
                    Add($"{path}.unit", $"Единица измерения не длиннее {MaxUnitLength} символов.");
            }
        }

        return errors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray());
    }
}
