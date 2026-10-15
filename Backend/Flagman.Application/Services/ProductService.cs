using Flagman.Application.Abstractions;
using Flagman.Domain.Abstractions;
using Flagman.Domain.Model;

namespace Flagman.Application.Services;

public sealed class ProductService(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork) : IProductService
{
    public Task<List<Product>> GetAllAsync(CancellationToken cancellationToken = default) =>
        productRepository.GetAllAsync(cancellationToken);

    public async Task<Product> CreateAsync(
        string name,
        string unit,
        CancellationToken cancellationToken = default)
    {
        var product = Product.Create(name, unit);
        productRepository.Add(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return product;
    }
}