using Flagman.Application.Abstractions;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;
using Flagman.Domain.ValueObjects;

namespace Flagman.Application.Features.Supplies.CreateSupply;

internal sealed class CreateSupplyHandler(
    ISupplyRepository supplies,
    IProductRepository products,
    IUnitOfWork unitOfWork,
    TimeProvider clock)
    : ICommandHandler<CreateSupplyCommand, SupplyResponse>
{
    private const string DefaultUnit = "шт";

    public async Task<Result<SupplyResponse>> HandleAsync(
        CreateSupplyCommand command,
        CancellationToken cancellationToken)
    {
        var errors = CreateSupplyValidator.Validate(command);
        if (errors.Count > 0)
            return Error.Validation(errors);

        var number = command.Number!.Trim();

        if (await supplies.ExistsByIdAsync(command.Id, cancellationToken))
            return Error.Conflict("Supply.IdExists", $"Поставка с id {command.Id} уже зарегистрирована.");

        if (await supplies.ExistsByNumberAsync(number, cancellationToken))
            return Error.Conflict("Supply.NumberExists", $"Поставка с номером «{number}» уже зарегистрирована.");

        var items = command.Items!;

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var knownProducts = (await products.GetByIdsAsync(productIds, cancellationToken))
            .ToDictionary(p => p.Id);

        var supply = Supply.Create(command.Id, number, command.CreatedAt ?? clock.GetUtcNow());

        foreach (var item in items)
        {
            if (!knownProducts.TryGetValue(item.ProductId, out var product))
            {
                // Новый продукт: заводим по данным из поставки
                var unit = string.IsNullOrWhiteSpace(item.Unit) ? DefaultUnit : item.Unit.Trim();
                product = Product.Create(item.ProductId, item.Name!.Trim(), unit);
                knownProducts[product.Id] = product;
            }

            // Каждая позиция = своя партия со своим ExpiresAt (один продукт может лежать в нескольких партиях)
            supply.AddBatch(product, Quantity.From(item.Quantity), ShelfLife.FromHours(item.ShelfLifeHours));
        }

        supplies.Add(supply);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return supply.ToResponse();
    }
}


