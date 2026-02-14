namespace MachineSimulator.Backend.Models;

public class Cap : IItem
{
    public string Id { get; }
    public string Name => "Cap";

    public Cap(string id)
    {
        Id = id;
    }
}
