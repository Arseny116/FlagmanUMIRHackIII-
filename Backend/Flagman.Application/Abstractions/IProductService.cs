using Flagman.Domain.Model;

namespace Flagman.Application.Abstractions
{
public interface IProductService
{
    Task<List<Product>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Product> CreateAsync(string name, string unit, CancellationToken cancellationToken = default);
}
}
