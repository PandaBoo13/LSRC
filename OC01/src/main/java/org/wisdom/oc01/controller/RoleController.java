package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.RoleRequest;
import org.wisdom.oc01.service.RoleService;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class RoleController {

    @Autowired
    private RoleService roleService;



    @PostMapping
    public ResponseEntity<RequestResponse> createRole(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(roleService.createRole(request), "Role created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequestResponse> updateRole(@PathVariable Integer id,
                                                      @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(new RequestResponse(roleService.updateRole(id, request), "Role updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<RequestResponse> deleteRole(@PathVariable Integer id) {
        roleService.delete(id);
        return ResponseEntity.ok(new RequestResponse("Role deleted successfully"));
    }


}