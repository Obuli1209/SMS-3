document.getElementById('addRowButton').addEventListener('click', async () => {
    const roleName = document.getElementById('addRoleName').value;
  
    if (!roleName.trim()) {
      alert("Role name is required");
      return;
    }
  
    try {
      const response = await fetch('/api/userRole/addrole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName, status: 'Active' })
      });
  
      if (!response.ok) throw new Error("Failed to add role");
  
      const result = await response.json();
      const modalEl = bootstrap.Modal.getInstance(document.getElementById('addRowModal'));
      modalEl.hide();
      document.getElementById('addRoleForm').reset();
      table.ajax.reload();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  });