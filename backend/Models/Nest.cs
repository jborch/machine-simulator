namespace MachineSimulator.Backend.Models;

public class Nest : ICarrier
{
    public string Id { get; }
    public IItem? CurrentItem { get; private set; }

    public Nest(string id)
    {
        Id = id;
    }

    public void Load(IItem item)
    {
        CurrentItem = item;
    }

    public void Unload()
    {
        CurrentItem = null;
    }
}
