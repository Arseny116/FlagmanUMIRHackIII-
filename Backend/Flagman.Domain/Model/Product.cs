using Flagman.Domain.Abstractions;

namespace Flagman.Domain.Model;

public class Product : Entity
{
    public string Name { get; set; } = string.Empty;
}
