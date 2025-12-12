
import { Box, Button, Modal, ModalClose, Select, Sheet, Table, Typography, Option, Input, FormControl, FormLabel } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import AddIcon from '@mui/icons-material/Add';
import useApiRequests from './API.tsx'
import { notification } from '../Utils'

function Users() {
    const [users, setUsers] = useState<{
        id: number
        username: string
        email: string
        firstName: string
        lastName: string
        role: string
        createdAt: string
    }[]>([])
    const [createOpen, setCreateOpen] = useState(false)
    const [newData, setNewData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'USER'
    })
    const [refresh, setRefresh] = useState(false)
    const requests = useApiRequests()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await requests.getUsers()
                if (response.status === 200) {
                    setUsers(response.data.data)
                }
            } catch (e) {
                console.error(e)
                notification("Failed to fetch users", "error")
            }
        }
        fetchData()

    }, [refresh])

    const handleCreate = async () => {
        try {
            const response = await requests.createUser(newData)
            if (response.status === 200) {
                notification("User created successfully", "success")
                setCreateOpen(false)
                setRefresh(!refresh)
                setNewData({
                    username: '',
                    password: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    role: 'USER'
                })
            }
        } catch (e: any) {
            notification(e.response?.data?.msg || "Failed to create user", "error")
        }
    }

    const handleChange = (key: string, value: string) => {
        setNewData(prev => ({ ...prev, [key]: value }))
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography level="h3">Users</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startDecorator={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ px: 1 }} size="sm">User</Button>
                </Box>
            </Box>
            <Table stripe="odd">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.role}</td>
                            <td>{new Date(user.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ minWidth: 400, borderRadius: 'md', p: 3, boxShadow: 'lg', display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography id="modal-desc" sx={{ mb: 0 }} textColor="text.tertiary">
                        Create New User
                    </Typography>
                    
                    <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input value={newData.username} onChange={(e) => handleChange('username', e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input type="password" value={newData.password} onChange={(e) => handleChange('password', e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" value={newData.email} onChange={(e) => handleChange('email', e.target.value)} />
                    </FormControl>
                     <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input value={newData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input value={newData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Role</FormLabel>
                        <Select value={newData.role} onChange={(_, newVal) => handleChange('role', newVal as string)}>
                            <Option value="USER">USER</Option>
                            <Option value="ADMIN">ADMIN</Option>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button color="success" size='sm' onClick={handleCreate} sx={{ mr: 2 }} >Create</Button>
                        <Button size='sm' onClick={() => setCreateOpen(false)} color='neutral'>Cancel</Button>
                    </Box>
                </Sheet>
            </Modal>
        </>
    )
}

export default Users
