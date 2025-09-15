"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
	MoreHorizontal,
	PlusCircle,
	Trash2,
	Filter,
	RefreshCw,
	Edit,
	UserCheck,
	UserX,
	Crown,
	Shield,
	User,
	AlertCircle,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAdminPapers } from "@/hooks/use-admin-papers";
import { useAdminUsers } from "@/hooks/use-admin-users";
import {
	useAdminCategories,
	AdminCategory,
} from "@/hooks/use-admin-categories";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPage() {
	const {
		papers,
		isLoading,
		error,
		status,
		updatePaperStatus,
		filterByStatus,
		refetch,
	} = useAdminPapers();

	const [selectedPaper, setSelectedPaper] = useState<any>(null);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState<
		"approved" | "pending" | "rejected"
	>("approved");
	const [rejectionReason, setRejectionReason] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Helper function to check if rejection reason is provided (for use in handleStatusUpdate)
	const checkRejectionReasonEmpty = () => {
		return (
			newStatus === "rejected" &&
			(!textareaRef.current?.value || !textareaRef.current.value.trim())
		);
	};

	const statusVariant = {
		approved: "default",
		pending: "secondary",
		rejected: "destructive",
	} as const;

	const handleStatusUpdate = async () => {
		if (!selectedPaper) return;

		// Check if rejection reason is required but missing
		if (checkRejectionReasonEmpty()) {
			alert("Please provide a rejection reason before updating the status.");
			return;
		}

		setIsUpdating(true);

		// Get the rejection reason directly from the textarea DOM element
		const finalRejectionReason =
			newStatus === "rejected" ? textareaRef.current?.value || "" : "";
		setRejectionReason(finalRejectionReason);

		const result = await updatePaperStatus(selectedPaper.id, {
			status: newStatus,
			reason: finalRejectionReason || undefined,
		});

		if (result.success) {
			setIsStatusDialogOpen(false);
			setSelectedPaper(null);
			setRejectionReason("");
			// Clear the textarea
			if (textareaRef.current) {
				textareaRef.current.value = "";
			}
		}
		setIsUpdating(false);
	};

	const openStatusDialog = (
		paper: any,
		status: "approved" | "pending" | "rejected"
	) => {
		setSelectedPaper(paper);
		setNewStatus(status);
		setRejectionReason(paper.rejectionReason || "");
		// Initialize the textarea with existing rejection reason
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.value = paper.rejectionReason || "";
			}
		}, 0);
		setIsStatusDialogOpen(true);
	};

	const PostsTab = () => (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Manage Posts</CardTitle>
							<CardDescription>
								Review, approve, or reject user-submitted papers.
							</CardDescription>
						</div>
						<div className="flex items-center justify-between">
							<div className="ml-auto flex items-center gap-2">
								<Select value={status} onValueChange={filterByStatus}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Papers</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="approved">Approved</SelectItem>
										<SelectItem value="rejected">Rejected</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" size="icon" onClick={refetch}>
									<RefreshCw className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="text-red-600 bg-red-50 p-3 rounded-md mb-4">
							Error: {error}
						</div>
					)}

					{isLoading ? (
						<div className="text-center py-10">Loading papers...</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Author</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Interactions</TableHead>
									<TableHead>
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{papers.map((paper) => (
									<TableRow key={paper.id}>
										<TableCell className="font-medium max-w-[200px] truncate">
											{paper.name || paper.title}
										</TableCell>
										<TableCell>{paper.authorName}</TableCell>
										<TableCell>
											{paper.category?.name || paper.categoryName}
										</TableCell>
										<TableCell>
											<Badge
												variant={statusVariant[paper.status]}
												className="capitalize"
											>
												{paper.status}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{format(new Date(paper.createdAt), "MMM dd, yyyy")}
										</TableCell>
										<TableCell className="text-sm">
											<div className="flex gap-2">
												<span>❤️ {paper.interactions?.reactions || 0}</span>
												<span>💬 {paper.interactions?.comments || 0}</span>
												<span>🔖 {paper.interactions?.saves || 0}</span>
											</div>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														aria-haspopup="true"
														size="icon"
														variant="ghost"
													>
														<MoreHorizontal className="h-4 w-4" />
														<span className="sr-only">Toggle menu</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Change Status</DropdownMenuLabel>
													<DropdownMenuItem
														onClick={() => openStatusDialog(paper, "approved")}
													>
														✅ Approve
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => openStatusDialog(paper, "pending")}
													>
														⏳ Set Pending
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => openStatusDialog(paper, "rejected")}
													>
														❌ Reject
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Status Update Dialog */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Paper Status</DialogTitle>
						<DialogDescription>
							{selectedPaper && (
								<>
									Change the status of "
									{selectedPaper.name || selectedPaper.title}" to{" "}
									<span className="font-semibold capitalize">{newStatus}</span>
								</>
							)}
						</DialogDescription>
					</DialogHeader>

					{newStatus === "rejected" && (
						<div className="space-y-2" dir="ltr">
							<Label htmlFor="rejection-reason">Rejection Reason</Label>
							<Textarea
								ref={textareaRef}
								id="rejection-reason"
								placeholder="Please provide a reason for rejection..."
								defaultValue=""
								rows={3}
								dir="ltr"
								className="text-left"
								style={{
									direction: "ltr",
									textAlign: "left",
									unicodeBidi: "embed",
									writingMode: "horizontal-tb",
								}}
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsStatusDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleStatusUpdate} disabled={isUpdating}>
							{isUpdating ? "Updating..." : "Update Status"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);

	const CategoriesTab = () => {
		const {
			categories,
			isLoading,
			error,
			fetchCategories,
			createCategory,
			updateCategory,
			deleteCategory,
		} = useAdminCategories();

		const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
		const [selectedCategory, setSelectedCategory] =
			useState<AdminCategory | null>(null);

		useEffect(() => {
			fetchCategories();
		}, []);

		const handleEditCategory = (category: AdminCategory) => {
			setSelectedCategory(category);
			setIsEditDialogOpen(true);
		};

		const handleDeleteCategory = async (
			categoryId: string,
			categoryName: string
		) => {
			if (
				!confirm(`Are you sure you want to delete category "${categoryName}"?`)
			) {
				return;
			}

			const result = await deleteCategory(categoryId);
			if (!result.success) {
				alert(`Error deleting category: ${result.error}`);
			}
		};

		const CategoryForm = ({
			category,
			onSubmit,
			onClose,
			isEdit = false,
		}: {
			category?: AdminCategory;
			onSubmit: (data: any) => Promise<void>;
			onClose: () => void;
			isEdit?: boolean;
		}) => {
			const [formData, setFormData] = useState({
				id: category?.id || "",
				name: category?.name || "",
				description: category?.description || "",
				imageUrl: category?.imageUrl || "",
				imageHint: category?.imageHint || "",
			});

			const handleSubmit = async (e: React.FormEvent) => {
				e.preventDefault();
				await onSubmit(formData);
			};

			return (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="categoryId">Category ID</Label>
						<Input
							id="categoryId"
							value={formData.id}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, id: e.target.value }))
							}
							placeholder="Enter category ID"
							required
						/>
						{isEdit && (
							<p className="text-sm text-muted-foreground mt-1">
								Changing the ID will create a new category with this ID and
								delete the old one.
							</p>
						)}
					</div>
					<div>
						<Label htmlFor="categoryName">Category Name</Label>
						<Input
							id="categoryName"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Enter category name"
							required
						/>
					</div>
					<div>
						<Label htmlFor="categoryDescription">Description</Label>
						<Textarea
							id="categoryDescription"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Enter category description (optional)"
							rows={3}
						/>
					</div>
					<div>
						<Label htmlFor="categoryImageUrl">Image URL</Label>
						<Input
							id="categoryImageUrl"
							value={formData.imageUrl}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
							}
							placeholder="Enter image URL (optional)"
							type="url"
						/>
					</div>
					<div>
						<Label htmlFor="categoryImageHint">Image Hint</Label>
						<Input
							id="categoryImageHint"
							value={formData.imageHint}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, imageHint: e.target.value }))
							}
							placeholder="Enter image hint (optional)"
						/>
					</div>
					<div className="flex justify-end gap-2 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">
							{isEdit ? "Update Category" : "Create Category"}
						</Button>
					</div>
				</form>
			);
		};

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Categories Management</h2>
					<Button onClick={() => setIsAddDialogOpen(true)}>Add Category</Button>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Image URL</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center text-muted-foreground py-8"
										>
											No categories found
										</TableCell>
									</TableRow>
								) : (
									categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell className="font-medium">
												{category.id}
											</TableCell>
											<TableCell>{category.name}</TableCell>
											<TableCell className="max-w-xs truncate">
												{category.description || "No description"}
											</TableCell>
											<TableCell className="max-w-xs truncate">
												{category.imageUrl ? (
													<a
														href={category.imageUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline"
													>
														View Image
													</a>
												) : (
													"No image"
												)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEditCategory(category)}
													>
														Edit
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() =>
															handleDeleteCategory(category.id, category.name)
														}
													>
														Delete
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Add Category Dialog */}
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Category</DialogTitle>
						</DialogHeader>
						<CategoryForm
							onSubmit={async (data) => {
								const result = await createCategory(data);
								if (result.success) {
									setIsAddDialogOpen(false);
								} else {
									alert(`Error creating category: ${result.error}`);
								}
							}}
							onClose={() => setIsAddDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>

				{/* Edit Category Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Edit Category</DialogTitle>
						</DialogHeader>
						{selectedCategory && (
							<CategoryForm
								category={selectedCategory}
								isEdit={true}
								onSubmit={async (data) => {
									const { id: newId, ...updates } = data;
									const updateData = {
										...updates,
										...(newId !== selectedCategory.id ? { newId } : {}),
									};
									const result = await updateCategory(
										selectedCategory.id,
										updateData
									);
									if (result.success) {
										setIsEditDialogOpen(false);
										setSelectedCategory(null);
									} else {
										alert(`Error updating category: ${result.error}`);
									}
								}}
								onClose={() => {
									setIsEditDialogOpen(false);
									setSelectedCategory(null);
								}}
							/>
						)}
					</DialogContent>
				</Dialog>
			</div>
		);
	};

	const UsersTab = () => {
		const {
			users,
			isLoading: usersLoading,
			error: usersError,
			fetchUsers,
			updateUserRole,
			updateUser,
			deleteUser,
		} = useAdminUsers();

		const [userRoleFilter, setUserRoleFilter] = useState("all");
		const [userSearch, setUserSearch] = useState("");
		const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
		const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
		const [selectedUser, setSelectedUser] = useState<any>(null);
		const [editUserData, setEditUserData] = useState({
			full_name: "",
			email: "",
			birth_date: "",
			college_name: "",
			country: "",
		});
		const [newUserRole, setNewUserRole] = useState("");
		const [isUserUpdating, setIsUserUpdating] = useState(false);

		// Fetch users on component mount and when filters change
		useEffect(() => {
			fetchUsers({ role: userRoleFilter, search: userSearch });
		}, []);

		const handleUserFilterChange = (role: string) => {
			setUserRoleFilter(role);
			fetchUsers({
				role: role === "all" ? undefined : role,
				search: userSearch,
			});
		};

		const handleUserSearch = (search: string) => {
			setUserSearch(search);
			fetchUsers({
				role: userRoleFilter === "all" ? undefined : userRoleFilter,
				search,
			});
		};

		const openEditUserDialog = (user: any) => {
			setSelectedUser(user);
			setEditUserData({
				full_name: user.full_name || "",
				email: user.email || "",
				birth_date: user.birth_date ? user.birth_date.split("T")[0] : "",
				college_name: user.college_name || "",
				country: user.country || "",
			});
			setIsEditUserDialogOpen(true);
		};

		const openRoleDialog = (user: any) => {
			setSelectedUser(user);
			setNewUserRole(user.role);
			setIsRoleDialogOpen(true);
		};

		const handleEditUser = async () => {
			if (!selectedUser) return;

			setIsUserUpdating(true);
			const result = await updateUser(selectedUser.id, editUserData);

			if (result.success) {
				setIsEditUserDialogOpen(false);
				setSelectedUser(null);
			} else {
				alert(result.error);
			}
			setIsUserUpdating(false);
		};

		const handleRoleUpdate = async () => {
			if (!selectedUser) return;

			setIsUserUpdating(true);
			const result = await updateUserRole(selectedUser.id, newUserRole);

			if (result.success) {
				setIsRoleDialogOpen(false);
				setSelectedUser(null);
			} else {
				alert(result.error);
			}
			setIsUserUpdating(false);
		};

		const handleDeleteUser = async (userId: number) => {
			if (
				confirm(
					"Are you sure you want to delete this user? This action cannot be undone."
				)
			) {
				const result = await deleteUser(userId);
				if (!result.success) {
					alert(result.error);
				}
			}
		};

		const getRoleBadge = (role: string) => {
			switch (role) {
				case "owner":
					return (
						<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
							<Crown className="w-3 h-3 mr-1" />
							Owner
						</Badge>
					);
				case "admin":
					return (
						<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
							<Shield className="w-3 h-3 mr-1" />
							Admin
						</Badge>
					);
				default:
					return (
						<Badge variant="secondary">
							<User className="w-3 h-3 mr-1" />
							User
						</Badge>
					);
			}
		};

		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Manage Users</CardTitle>
						<CardDescription>
							View and manage all users, their roles, and permissions.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Filters */}
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<div className="flex-1">
								<Label htmlFor="user-search">Search Users</Label>
								<Input
									id="user-search"
									placeholder="Search by name or email..."
									value={userSearch}
									onChange={(e) => handleUserSearch(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<div>
									<Label htmlFor="user-role-filter">Filter by Role</Label>
									<Select
										value={userRoleFilter}
										onValueChange={handleUserFilterChange}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Roles</SelectItem>
											<SelectItem value="user">Users</SelectItem>
											<SelectItem value="admin">Admins</SelectItem>
											<SelectItem value="owner">Owners</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-end">
									<Button
										variant="outline"
										onClick={() =>
											fetchUsers({
												role:
													userRoleFilter === "all" ? undefined : userRoleFilter,
												search: userSearch,
											})
										}
									>
										<RefreshCw className="w-4 h-4 mr-2" />
										Refresh
									</Button>
								</div>
							</div>
						</div>

						{/* Users Table */}
						{usersLoading ? (
							<div className="text-center py-8">
								<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
								<p>Loading users...</p>
							</div>
						) : usersError ? (
							<div className="text-center py-8 text-destructive">
								<p>Error: {usersError}</p>
								<Button
									variant="outline"
									className="mt-2"
									onClick={() =>
										fetchUsers({
											role:
												userRoleFilter === "all" ? undefined : userRoleFilter,
											search: userSearch,
										})
									}
								>
									Retry
								</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>College</TableHead>
										<TableHead>Country</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{user.avatar_url ? (
														<img
															src={user.avatar_url}
															alt={user.full_name}
															className="w-8 h-8 rounded-full object-cover"
														/>
													) : (
														<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
															<User className="w-4 h-4 text-gray-500" />
														</div>
													)}
													<div>
														<p className="font-medium">{user.full_name}</p>
														<p className="text-sm text-muted-foreground">
															ID: {user.id}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{getRoleBadge(user.role)}</TableCell>
											<TableCell>{user.college_name}</TableCell>
											<TableCell>{user.country}</TableCell>
											<TableCell>
												{format(new Date(user.created_at), "MMM dd, yyyy")}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() => openEditUserDialog(user)}
														>
															<Edit className="w-4 h-4 mr-2" />
															Edit Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => openRoleDialog(user)}
														>
															<UserCheck className="w-4 h-4 mr-2" />
															Change Role
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => handleDeleteUser(user.id)}
														>
															<Trash2 className="w-4 h-4 mr-2" />
															Delete User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
									{users.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={7}
												className="text-center py-8 text-muted-foreground"
											>
												No users found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Edit User Dialog */}
				<Dialog
					open={isEditUserDialogOpen}
					onOpenChange={setIsEditUserDialogOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit User Details</DialogTitle>
							<DialogDescription>
								Update user information. Changes will be saved immediately.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-name">Full Name</Label>
								<Input
									id="edit-name"
									value={editUserData.full_name}
									onChange={(e) =>
										setEditUserData({
											...editUserData,
											full_name: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-email">Email</Label>
								<Input
									id="edit-email"
									type="email"
									value={editUserData.email}
									onChange={(e) =>
										setEditUserData({ ...editUserData, email: e.target.value })
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-birth-date">Birth Date</Label>
								<Input
									id="edit-birth-date"
									type="date"
									value={editUserData.birth_date}
									onChange={(e) =>
										setEditUserData({
											...editUserData,
											birth_date: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-college">College Name</Label>
								<Input
									id="edit-college"
									value={editUserData.college_name}
									onChange={(e) =>
										setEditUserData({
											...editUserData,
											college_name: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-country">Country</Label>
								<Input
									id="edit-country"
									value={editUserData.country}
									onChange={(e) =>
										setEditUserData({
											...editUserData,
											country: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsEditUserDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleEditUser} disabled={isUserUpdating}>
								{isUserUpdating ? "Updating..." : "Update User"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Role Change Dialog */}
				<Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Change User Role</DialogTitle>
							<DialogDescription>
								{selectedUser && (
									<>
										Change the role for{" "}
										<strong>{selectedUser.full_name}</strong>. This will affect
										their permissions in the system.
									</>
								)}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Label htmlFor="new-role">Select New Role</Label>
							<Select value={newUserRole} onValueChange={setNewUserRole}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">
										<div className="flex items-center">
											<User className="w-4 h-4 mr-2" />
											User
										</div>
									</SelectItem>
									<SelectItem value="admin">
										<div className="flex items-center">
											<Shield className="w-4 h-4 mr-2" />
											Admin
										</div>
									</SelectItem>
									<SelectItem value="owner">
										<div className="flex items-center">
											<Crown className="w-4 h-4 mr-2" />
											Owner
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground mt-2">
								<strong>User:</strong> Can view and interact with papers
								<br />
								<strong>Admin:</strong> Can manage papers, categories, and users
								<br />
								<strong>Owner:</strong> Full control over the system including
								admin management
							</p>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsRoleDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleRoleUpdate} disabled={isUserUpdating}>
								{isUserUpdating ? "Updating..." : "Update Role"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	};

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
				<p className="text-muted-foreground">
					Manage the content and users of ScholarStream.
				</p>
			</div>
			<Tabs defaultValue="posts">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="insights">Insights</TabsTrigger>
				</TabsList>
				<TabsContent value="posts">
					<PostsTab />
				</TabsContent>
				<TabsContent value="users">
					<UsersTab />
				</TabsContent>
				<TabsContent value="categories">
					<CategoriesTab />
				</TabsContent>
				<TabsContent value="insights">
					<Card>
						<CardHeader>
							<CardTitle>General Insights</CardTitle>
							<CardDescription>This feature is coming soon.</CardDescription>
						</CardHeader>
						<CardContent className="text-center py-20 text-muted-foreground">
							<p>Analytics and insights dashboard will be here.</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
